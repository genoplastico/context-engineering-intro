'use client';

import { useState, useEffect, useCallback } from 'react';
import { Suggestion } from '@/types/task';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { useAuth } from './useAuth';

interface AIQuotaUsage {
  requestsUsed: number;
  requestsLimit: number;
  resetDate: Date;
}

interface UseSuggestionsReturn {
  suggestions: Suggestion[];
  loading: boolean;
  error: string | null;
  quotaUsage: AIQuotaUsage | null;
  generateSuggestions: (assetId: string) => Promise<void>;
  deleteSuggestion: (suggestionId: string) => Promise<void>;
  refetch: () => void;
}

export const useSuggestions = (assetId?: string): UseSuggestionsReturn => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaUsage, setQuotaUsage] = useState<AIQuotaUsage | null>(null);

  const { currentOrganization } = useOrganizationContext();
  const { user } = useAuth();

  const fetchSuggestions = useCallback(async () => {
    if (!currentOrganization || !user) {
      setSuggestions([]);
      setQuotaUsage(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        organizationId: currentOrganization.id,
        userId: user.uid,
      });

      if (assetId) {
        params.append('assetId', assetId);
      }

      const response = await fetch(`/api/suggestions?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch suggestions');
      }

      setSuggestions(data.suggestions || []);
      setQuotaUsage(data.quotaUsage || null);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch suggestions');
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, user, assetId]);

  const generateSuggestions = async (targetAssetId: string): Promise<void> => {
    if (!currentOrganization || !user) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assetId: targetAssetId,
          organizationId: currentOrganization.id,
          userId: user.uid,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      // Update local state with new suggestions
      const newSuggestions = data.suggestions || [];
      setSuggestions(prev => {
        // If filtering by asset, replace suggestions for this asset
        if (assetId && assetId === targetAssetId) {
          return [...prev.filter(s => s.assetId !== targetAssetId), ...newSuggestions];
        }
        // Otherwise, add to the beginning of the list
        return [...newSuggestions, ...prev];
      });

      setQuotaUsage(data.quotaUsage || null);
    } catch (err) {
      console.error('Error generating suggestions:', err);
      
      // Re-throw error for UI handling
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSuggestion = async (suggestionId: string): Promise<void> => {
    if (!currentOrganization || !user) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);

      const params = new URLSearchParams({
        suggestionId,
        organizationId: currentOrganization.id,
        userId: user.uid,
      });

      const response = await fetch(`/api/suggestions?${params}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete suggestion');
      }

      // Remove suggestion from local state
      setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    } catch (err) {
      console.error('Error deleting suggestion:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete suggestion');
      throw err;
    }
  };

  const refetch = useCallback(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    loading,
    error,
    quotaUsage,
    generateSuggestions,
    deleteSuggestion,
    refetch,
  };
};