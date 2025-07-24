'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Sparkles, DollarSign } from 'lucide-react';
import { Suggestion, TaskPriority, TaskFormData } from '@/types/task';
import { format } from 'date-fns';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onDelete: () => Promise<void>;
  onConvertToTask: (data: TaskFormData) => Promise<void>;
  assetName?: string;
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export const SuggestionCard: React.FC<SuggestionCardProps> = memo(({
  suggestion,
  onDelete,
  onConvertToTask,
  assetName,
}) => {
  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this suggestion?')) {
      await onDelete();
    }
  };

  const handleConvertToTask = async () => {
    const taskData: TaskFormData = {
      title: suggestion.title,
      description: suggestion.description,
      priority: suggestion.priority,
      assetId: suggestion.assetId,
      checklist: [],
    };

    await onConvertToTask(taskData);
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
              <Badge className={priorityColors[suggestion.priority]}>
                {suggestion.priority}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold">
              {suggestion.title}
            </CardTitle>
            {assetName && (
              <p className="text-sm text-gray-500 mt-1">
                For asset: {assetName}
              </p>
            )}
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={handleConvertToTask}>
              <Plus className="h-4 w-4 text-green-600" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-700">{suggestion.description}</p>
          
          {suggestion.estimatedCost && (
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Estimated Cost: ${suggestion.estimatedCost.toFixed(2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-gray-500">
              Suggested {format(suggestion.createdAt.toDate(), 'MMM dd, yyyy')}
            </span>
            <Button 
              size="sm" 
              onClick={handleConvertToTask}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create Task
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SuggestionCard.displayName = 'SuggestionCard';