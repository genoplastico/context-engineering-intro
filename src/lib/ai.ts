'use client';

import { GoogleGenerativeAI } from '@google/genai';
import { Asset } from '@/types/asset';
import { Suggestion, TaskPriority } from '@/types/task';
import { OrganizationDB, ORG_COLLECTIONS } from './db';
import { Timestamp } from 'firebase/firestore';
import { nanoid } from 'nanoid';

interface AIConfig {
  model: string;
  maxTokens: number;
  temperature: number;
}

interface AIQuotaUsage {
  requestsUsed: number;
  requestsLimit: number;
  resetDate: Date;
}

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private config: AIConfig = {
    model: 'gemini-pro',
    maxTokens: 1000,
    temperature: 0.7,
  };

  constructor() {
    // Initialize Gemini AI only on client side
    if (typeof window !== 'undefined') {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
      }
    }
  }

  private async checkQuotaUsage(orgDB: OrganizationDB): Promise<boolean> {
    try {
      // Get organization settings to check AI quota
      const orgSettings = await orgDB.get(ORG_COLLECTIONS.SETTINGS, 'ai-quota');
      
      if (!orgSettings) {
        // Initialize quota settings if they don't exist
        await orgDB.create(ORG_COLLECTIONS.SETTINGS, 'ai-quota', {
          requestsUsed: 0,
          requestsLimit: 100, // 100 requests per month
          resetDate: this.getNextMonthDate(),
        });
        return true;
      }

      const { requestsUsed, requestsLimit, resetDate } = orgSettings as any;
      
      // Check if quota has reset
      if (new Date() >= resetDate.toDate()) {
        await orgDB.update(ORG_COLLECTIONS.SETTINGS, 'ai-quota', {
          requestsUsed: 0,
          resetDate: this.getNextMonthDate(),
        });
        return true;
      }

      // Check if under quota limit
      return requestsUsed < requestsLimit;
    } catch (error) {
      console.error('Error checking AI quota:', error);
      return false;
    }
  }

  private async incrementQuotaUsage(orgDB: OrganizationDB): Promise<void> {
    try {
      const orgSettings = await orgDB.get(ORG_COLLECTIONS.SETTINGS, 'ai-quota');
      if (orgSettings) {
        const { requestsUsed } = orgSettings as any;
        await orgDB.update(ORG_COLLECTIONS.SETTINGS, 'ai-quota', {
          requestsUsed: requestsUsed + 1,
        });
      }
    } catch (error) {
      console.error('Error incrementing AI quota:', error);
    }
  }

  private getNextMonthDate(): Timestamp {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Timestamp.fromDate(nextMonth);
  }

  async getQuotaUsage(orgDB: OrganizationDB): Promise<AIQuotaUsage> {
    try {
      const orgSettings = await orgDB.get(ORG_COLLECTIONS.SETTINGS, 'ai-quota');
      
      if (!orgSettings) {
        return {
          requestsUsed: 0,
          requestsLimit: 100,
          resetDate: this.getNextMonthDate().toDate(),
        };
      }

      const { requestsUsed, requestsLimit, resetDate } = orgSettings as any;
      
      return {
        requestsUsed,
        requestsLimit,
        resetDate: resetDate.toDate(),
      };
    } catch (error) {
      console.error('Error getting AI quota usage:', error);
      return {
        requestsUsed: 0,
        requestsLimit: 100,
        resetDate: this.getNextMonthDate().toDate(),
      };
    }
  }

  private buildMaintenancePrompt(asset: Asset, taskHistory?: any[]): string {
    const basePrompt = `
You are an expert maintenance advisor. Analyze the following asset and provide maintenance suggestions.

Asset Information:
- Name: ${asset.name}
- Description: ${asset.description || 'No description provided'}
- Metadata: ${JSON.stringify(asset.metadata, null, 2)}
- Created: ${asset.createdAt.toDate().toLocaleDateString()}
- Last Updated: ${asset.updatedAt.toDate().toLocaleDateString()}

${taskHistory && taskHistory.length > 0 ? `
Recent Task History:
${taskHistory.map(task => `
- ${task.title} (${task.status}): ${task.description}
  Completed: ${task.completedAt ? task.completedAt.toDate().toLocaleDateString() : 'Not completed'}
`).join('')}
` : ''}

Please provide 1-3 specific maintenance suggestions for this asset. For each suggestion, include:
1. A clear, actionable title
2. A detailed description of what needs to be done and why
3. Priority level (LOW, MEDIUM, HIGH, or URGENT)
4. Estimated cost range in USD (if applicable)

Focus on:
- Preventive maintenance based on asset type and age
- Safety considerations
- Cost-effective maintenance strategies
- Industry best practices

Format your response as a JSON array of suggestions:
[
  {
    "title": "Suggestion title",
    "description": "Detailed description",
    "priority": "MEDIUM",
    "estimatedCost": 150.00
  }
]

Only return the JSON array, no additional text.
`;

    return basePrompt.trim();
  }

  async generateMaintenanceSuggestions(
    asset: Asset,
    orgDB: OrganizationDB,
    userId: string,
    taskHistory?: any[]
  ): Promise<Suggestion[]> {
    if (!this.genAI) {
      throw new Error('AI service not initialized. Please check your API key.');
    }

    // Check quota before making request
    const hasQuota = await this.checkQuotaUsage(orgDB);
    if (!hasQuota) {
      throw new Error('Monthly AI quota exceeded. Please wait until next month or upgrade your plan.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.config.model });
      const prompt = this.buildMaintenancePrompt(asset, taskHistory);

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Increment quota usage
      await this.incrementQuotaUsage(orgDB);

      // Parse AI response
      let suggestions: any[];
      try {
        suggestions = JSON.parse(text);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      // Validate and create suggestion objects
      const validSuggestions: Suggestion[] = [];
      
      for (const suggestion of suggestions) {
        if (suggestion.title && suggestion.description && suggestion.priority) {
          const suggestionId = nanoid();
          
          const suggestionObj: Suggestion = {
            id: suggestionId,
            organizationId: asset.organizationId,
            assetId: asset.id,
            title: suggestion.title,
            description: suggestion.description,
            priority: this.validatePriority(suggestion.priority),
            estimatedCost: suggestion.estimatedCost || undefined,
            aiGenerated: true,
            createdAt: Timestamp.now(),
          };

          // Store suggestion in database
          await orgDB.create<Suggestion>(ORG_COLLECTIONS.SUGGESTIONS, suggestionId, {
            assetId: asset.id,
            title: suggestion.title,
            description: suggestion.description,
            priority: suggestionObj.priority,
            estimatedCost: suggestion.estimatedCost || undefined,
            aiGenerated: true,
          });

          validSuggestions.push(suggestionObj);
        }
      }

      return validSuggestions;
    } catch (error) {
      console.error('Error generating maintenance suggestions:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to generate maintenance suggestions. Please try again.');
    }
  }

  private validatePriority(priority: string): TaskPriority {
    const validPriorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const upperPriority = priority.toUpperCase() as TaskPriority;
    
    if (validPriorities.includes(upperPriority)) {
      return upperPriority;
    }
    
    return 'MEDIUM'; // Default fallback
  }

  async getSuggestionHistory(orgDB: OrganizationDB, assetId?: string): Promise<Suggestion[]> {
    try {
      const constraints = [];
      
      if (assetId) {
        constraints.push({ field: 'assetId', operator: '==', value: assetId });
      }
      
      // Add ordering by creation date
      constraints.push({ field: 'createdAt', operator: 'desc' });

      const suggestions = await orgDB.query<Suggestion>(
        ORG_COLLECTIONS.SUGGESTIONS,
        constraints as any
      );

      return suggestions;
    } catch (error) {
      console.error('Error getting suggestion history:', error);
      return [];
    }
  }

  async deleteSuggestion(orgDB: OrganizationDB, suggestionId: string): Promise<void> {
    try {
      await orgDB.delete(ORG_COLLECTIONS.SUGGESTIONS, suggestionId);
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      throw new Error('Failed to delete suggestion');
    }
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }
}

export const aiService = new AIService();