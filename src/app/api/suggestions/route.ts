import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai';
import { OrganizationDB, validateOrganizationAccess } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { assetId, organizationId, userId } = await request.json();

    // Validate required fields
    if (!assetId || !organizationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: assetId, organizationId, userId' },
        { status: 400 }
      );
    }

    // Validate organization access
    const userRole = await validateOrganizationAccess(userId, organizationId);
    if (!userRole) {
      return NextResponse.json(
        { error: 'Unauthorized: User does not have access to this organization' },
        { status: 403 }
      );
    }

    // Check if AI service is available
    if (!aiService.isAvailable()) {
      return NextResponse.json(
        { error: 'AI service is not available. Please check configuration.' },
        { status: 503 }
      );
    }

    // Initialize organization database
    const orgDB = new OrganizationDB(organizationId, userId);

    // Get asset information
    const asset = await orgDB.get('assets', assetId);
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Get recent task history for the asset (optional context)
    const taskHistory = await orgDB.query('tasks', [
      { field: 'assetId', operator: '==', value: assetId }
    ]);

    // Generate suggestions using AI
    const suggestions = await aiService.generateMaintenanceSuggestions(
      asset as any,
      orgDB,
      userId,
      taskHistory.slice(0, 5) // Last 5 tasks for context
    );

    return NextResponse.json({
      success: true,
      suggestions,
      quotaUsage: await aiService.getQuotaUsage(orgDB)
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('quota exceeded')) {
        return NextResponse.json(
          { error: error.message },
          { status: 429 } // Too Many Requests
        );
      }
      
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate maintenance suggestions' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');
    const assetId = searchParams.get('assetId');

    // Validate required fields
    if (!organizationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, userId' },
        { status: 400 }
      );
    }

    // Validate organization access
    const userRole = await validateOrganizationAccess(userId, organizationId);
    if (!userRole) {
      return NextResponse.json(
        { error: 'Unauthorized: User does not have access to this organization' },
        { status: 403 }
      );
    }

    // Initialize organization database
    const orgDB = new OrganizationDB(organizationId, userId);

    // Get suggestion history
    const suggestions = await aiService.getSuggestionHistory(orgDB, assetId || undefined);

    // Get quota usage
    const quotaUsage = await aiService.getQuotaUsage(orgDB);

    return NextResponse.json({
      success: true,
      suggestions,
      quotaUsage
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const suggestionId = searchParams.get('suggestionId');
    const organizationId = searchParams.get('organizationId');
    const userId = searchParams.get('userId');

    // Validate required fields
    if (!suggestionId || !organizationId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: suggestionId, organizationId, userId' },
        { status: 400 }
      );
    }

    // Validate organization access
    const userRole = await validateOrganizationAccess(userId, organizationId);
    if (!userRole) {
      return NextResponse.json(
        { error: 'Unauthorized: User does not have access to this organization' },
        { status: 403 }
      );
    }

    // Initialize organization database
    const orgDB = new OrganizationDB(organizationId, userId);

    // Delete suggestion
    await aiService.deleteSuggestion(orgDB, suggestionId);

    return NextResponse.json({
      success: true,
      message: 'Suggestion deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting suggestion:', error);
    
    return NextResponse.json(
      { error: 'Failed to delete suggestion' },
      { status: 500 }
    );
  }
}