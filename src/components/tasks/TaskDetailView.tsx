'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WhatsAppShare } from '@/components/ui/whatsapp-share';
import { 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  CheckSquare, 
  Square, 
  DollarSign, 
  Plus, 
  X,
  Repeat
} from 'lucide-react';
import { Task, TaskFormData, TaskStatus, TaskPriority, ChecklistItem, TaskCost } from '@/types/task';
import { TaskFormDialog } from './TaskForm';
import { useTasks } from '@/hooks/useTasks';
import { format } from 'date-fns';

interface TaskDetailViewProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (data: TaskFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  onStatusChange: (status: TaskStatus) => Promise<void>;
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

export const TaskDetailView: React.FC<TaskDetailViewProps> = ({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [newCostAmount, setNewCostAmount] = useState('');
  const [newCostDescription, setNewCostDescription] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const { updateChecklist, addCost, removeCost } = useTasks();

  const handleEdit = async (data: TaskFormData) => {
    await onEdit(data);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await onDelete();
      onOpenChange(false);
    }
  };

  const handleChecklistToggle = async (itemId: string) => {
    const updatedChecklist = task.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    await updateChecklist(task.id, updatedChecklist);
  };

  const handleAddCost = async () => {
    if (!newCostAmount || parseFloat(newCostAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    await addCost(task.id, {
      amount: parseFloat(newCostAmount),
      currency: 'USD',
      description: newCostDescription || undefined,
    });

    setNewCostAmount('');
    setNewCostDescription('');
  };

  const handleRemoveCost = async (costId: string) => {
    if (window.confirm('Are you sure you want to remove this cost?')) {
      await removeCost(task.id, costId);
    }
  };

  const handleStatusChangeWithNotes = async (status: TaskStatus) => {
    if (status === 'COMPLETED' && completionNotes) {
      // Handle completion notes separately if needed
    }
    await onStatusChange(status);
    setCompletionNotes('');
  };

  const completedItems = task.checklist.filter(item => item.completed).length;
  const totalItems = task.checklist.length;
  const completionPercentage = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  const totalCost = task.costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{task.title}</DialogTitle>
            <div className="flex space-x-2">
              <WhatsAppShare task={task} variant="button" size="sm" />
              <TaskFormDialog task={task} onSubmit={handleEdit}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </TaskFormDialog>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Task Details</CardTitle>
                  <div className="flex space-x-2">
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{task.description}</p>
                </div>

                {task.dueDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      <p className={`font-medium ${
                        task.dueDate.toDate() < new Date() && task.status !== 'COMPLETED'
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}>
                        {format(task.dueDate.toDate(), 'MMMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {task.assignedTo && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Assigned To</p>
                      <p className="font-medium">Team Member</p>
                    </div>
                  </div>
                )}

                {task.recurring && (
                  <div>
                    <h4 className="font-medium mb-2">Recurring Schedule</h4>
                    <p className="text-gray-600">
                      Every {task.recurring.interval} {task.recurring.frequency.toLowerCase()}
                      {task.recurring.endDate && (
                        <span> until {format(task.recurring.endDate.toDate(), 'MMM dd, yyyy')}</span>
                      )}
                      {task.recurring.maxOccurrences && (
                        <span> (max {task.recurring.maxOccurrences} times)</span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Checklist */}
            {task.checklist.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Checklist</CardTitle>
                    <div className="text-sm text-gray-600">
                      {completedItems}/{totalItems} completed ({Math.round(completionPercentage)}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.checklist.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <button
                          onClick={() => handleChecklistToggle(item.id)}
                          className="flex-shrink-0"
                        >
                          {item.completed ? (
                            <CheckSquare className="h-5 w-5 text-green-600" />
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <span className={`flex-1 ${
                          item.completed 
                            ? 'line-through text-gray-500' 
                            : 'text-gray-900'
                        }`}>
                          {item.text}
                        </span>
                        {item.completed && item.completedAt && (
                          <span className="text-xs text-gray-400">
                            {format(item.completedAt.toDate(), 'MMM dd')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Costs */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Costs</CardTitle>
                  <div className="text-lg font-semibold text-green-600">
                    Total: ${totalCost.toFixed(2)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Cost Form */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-3">Add Cost</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newCostAmount}
                        onChange={(e) => setNewCostAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newCostDescription}
                        onChange={(e) => setNewCostDescription(e.target.value)}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleAddCost} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cost List */}
                <div className="space-y-2">
                  {task.costs.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No costs recorded yet</p>
                  ) : (
                    task.costs.map((cost) => (
                      <div key={cost.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">${cost.amount.toFixed(2)}</p>
                            {cost.description && (
                              <p className="text-sm text-gray-600">{cost.description}</p>
                            )}
                            <p className="text-xs text-gray-400">
                              Added {format(cost.addedAt.toDate(), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCost(cost.id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {task.status === 'PENDING' && (
                  <Button 
                    className="w-full"
                    onClick={() => handleStatusChangeWithNotes('IN_PROGRESS')}
                  >
                    Start Task
                  </Button>
                )}
                
                {task.status === 'IN_PROGRESS' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
                      <Textarea
                        id="completion-notes"
                        value={completionNotes}
                        onChange={(e) => setCompletionNotes(e.target.value)}
                        placeholder="Add notes about task completion..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusChangeWithNotes('COMPLETED')}
                    >
                      Complete Task
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => handleStatusChangeWithNotes('PENDING')}
                    >
                      Pause Task
                    </Button>
                  </>
                )}
                
                {task.status === 'COMPLETED' && (
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStatusChangeWithNotes('IN_PROGRESS')}
                  >
                    Reopen Task
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Task History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Task created</p>
                      <p className="text-xs text-gray-500">
                        {format(task.createdAt.toDate(), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  {task.completedAt && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Task completed</p>
                        <p className="text-xs text-gray-500">
                          {format(task.completedAt.toDate(), 'MMM dd, yyyy • h:mm a')}
                        </p>
                        {task.completionNotes && (
                          <p className="text-xs text-gray-600 mt-1">
                            "{task.completionNotes}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};