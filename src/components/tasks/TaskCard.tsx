'use client';

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatsAppQuickShare } from '@/components/ui/whatsapp-share';
import { Edit, Trash2, Eye, Calendar, User, CheckSquare, DollarSign, Repeat } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '@/types/task';
import { TaskFormDialog } from './TaskForm';
import { TaskFormData } from '@/types/task';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (data: TaskFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  onView?: () => void;
  onStatusChange: (status: TaskStatus) => void;
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const statusColors: Record<TaskStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export const TaskCard: React.FC<TaskCardProps> = memo(({
  task,
  onEdit,
  onDelete,
  onView,
  onStatusChange,
}) => {
  const handleEdit = async (data: TaskFormData) => {
    await onEdit(data);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete();
    }
  };

  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const totalCost = task.costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={priorityColors[task.priority]}>
                {task.priority}
              </Badge>
              <Badge className={statusColors[task.status]}>
                {task.status.replace('_', ' ')}
              </Badge>
              {task.recurring && (
                <Badge variant="outline">
                  <Repeat className="h-3 w-3 mr-1" />
                  Recurring
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold truncate">
              {task.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {task.description}
            </p>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <WhatsAppQuickShare task={task} />
            <TaskFormDialog task={task} onSubmit={handleEdit}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </TaskFormDialog>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar for Checklist */}
          {totalItems > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <CheckSquare className="h-4 w-4" />
                  <span>Progress</span>
                </div>
                <span>{completedItems}/{totalItems} completed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Cost Summary */}
          {totalCost > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span>Total Cost: ${totalCost.toFixed(2)}</span>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className={
                task.dueDate.toDate() < new Date() && task.status !== 'COMPLETED'
                  ? 'text-red-600 font-medium'
                  : 'text-gray-600'
              }>
                Due: {format(task.dueDate.toDate(), 'MMM dd, yyyy')}
              </span>
            </div>
          )}

          {/* Assignment */}
          {task.assignedTo && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Assigned to member</span>
            </div>
          )}

          {/* Status Actions */}
          <div className="flex space-x-2 pt-2 border-t">
            {task.status === 'PENDING' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange('IN_PROGRESS')}
              >
                Start Task
              </Button>
            )}
            {task.status === 'IN_PROGRESS' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusChange('COMPLETED')}
                >
                  Complete
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusChange('PENDING')}
                >
                  Pause
                </Button>
              </>
            )}
            {task.status === 'COMPLETED' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange('IN_PROGRESS')}
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

TaskCard.displayName = 'TaskCard';