'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { SuggestionCard } from './SuggestionCard';
import { useSuggestions } from '@/hooks/useSuggestions';
import { useTasks } from '@/hooks/useTasks';
import { useAssets } from '@/hooks/useAssets';
import { TaskFormData } from '@/types/task';
import { format } from 'date-fns';

interface SuggestionsListProps {
  assetId?: string;
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ assetId }) => {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assetId || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const { assets } = useAssets();
  const { createTask } = useTasks();
  const { 
    suggestions, 
    loading, 
    error, 
    quotaUsage, 
    generateSuggestions, 
    deleteSuggestion,
    refetch 
  } = useSuggestions(assetId);

  const handleGenerateSuggestions = async () => {
    if (!selectedAssetId) {
      alert('Please select an asset to generate suggestions for');
      return;
    }

    try {
      setIsGenerating(true);
      await generateSuggestions(selectedAssetId);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConvertToTask = async (suggestionId: string, taskData: TaskFormData) => {
    try {
      await createTask(taskData);
      await deleteSuggestion(suggestionId);
    } catch (error) {
      console.error('Error converting suggestion to task:', error);
      alert('Failed to create task from suggestion');
    }
  };

  const handleDeleteSuggestion = async (suggestionId: string) => {
    try {
      await deleteSuggestion(suggestionId);
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      alert('Failed to delete suggestion');
    }
  };

  const getAssetName = (assetId: string): string => {
    const asset = assets.find(a => a.id === assetId);
    return asset?.name || 'Unknown Asset';
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading suggestions: {error}</p>
            <Button variant="outline" className="mt-4" onClick={refetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Suggestions</h1>
          <p className="text-gray-600 mt-1">AI-powered maintenance recommendations</p>
        </div>
      </div>

      {/* Quota Usage */}
      {quotaUsage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              AI Usage This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {quotaUsage.requestsUsed}/{quotaUsage.requestsLimit}
                </p>
                <p className="text-sm text-gray-600">Requests used</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Resets on</p>
                <p className="font-medium">
                  {format(quotaUsage.resetDate, 'MMM dd, yyyy')}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    quotaUsage.requestsUsed >= quotaUsage.requestsLimit
                      ? 'bg-red-500'
                      : quotaUsage.requestsUsed >= quotaUsage.requestsLimit * 0.8
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${Math.min((quotaUsage.requestsUsed / quotaUsage.requestsLimit) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate New Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">
                Select Asset
              </label>
              <Select
                value={selectedAssetId}
                onValueChange={setSelectedAssetId}
                disabled={!!assetId} // Disable if asset is pre-selected
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an asset..." />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerateSuggestions}
              disabled={isGenerating || !selectedAssetId || (quotaUsage && quotaUsage.requestsUsed >= quotaUsage.requestsLimit)}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Suggestions
                </>
              )}
            </Button>
          </div>
          
          {quotaUsage && quotaUsage.requestsUsed >= quotaUsage.requestsLimit && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                Monthly AI quota exceeded. You'll need to wait until next month or upgrade your plan to generate more suggestions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggestions Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${suggestions.length} suggestion${suggestions.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="flex space-x-2 mb-2">
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : suggestions.length === 0 ? (
          // Empty state
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="text-6xl text-gray-300">🤖</div>
                <div>
                  <h3 className="text-lg font-semibold">No AI suggestions yet</h3>
                  <p className="text-gray-600 mt-2">
                    Select an asset and generate AI-powered maintenance suggestions
                  </p>
                </div>
                {selectedAssetId && (
                  <Button onClick={handleGenerateSuggestions} disabled={isGenerating}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate First Suggestions
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Suggestions list
          suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onDelete={() => handleDeleteSuggestion(suggestion.id)}
              onConvertToTask={(taskData) => handleConvertToTask(suggestion.id, taskData)}
              assetName={!assetId ? getAssetName(suggestion.assetId) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
};