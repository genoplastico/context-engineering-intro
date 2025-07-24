'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Repeat } from 'lucide-react';
import { Task, TaskFormData, TaskPriority } from '@/types/task';
import { useAssets } from '@/hooks/useAssets';

const taskFormSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().min(1, 'Task description is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const),
  assignedTo: z.string().optional(),
  assetId: z.string().optional(),
  dueDate: z.string().optional(),
  checklist: z.array(z.string().min(1, 'Checklist item cannot be empty')).max(20, 'Maximum 20 checklist items allowed'),
  recurring: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).optional(),
    interval: z.number().min(1).optional(),
    endDate: z.string().optional(),
    maxOccurrences: z.number().min(1).optional(),
  }).optional(),
});

type TaskFormSchemaType = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task | undefined;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: (() => void) | undefined;
  submitLabel?: string | undefined;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  submitLabel = 'Create Task',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recurringEnabled, setRecurringEnabled] = useState(false);

  const { assets } = useAssets();

  const form = useForm<TaskFormSchemaType>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      priority: task?.priority || 'MEDIUM',
      assignedTo: task?.assignedTo || '',
      assetId: task?.assetId || '',
      dueDate: task?.dueDate ? task.dueDate.toDate().toISOString().split('T')[0] : '',
      checklist: task?.checklist.map(item => item.text) || [''],
      recurring: {
        enabled: !!task?.recurring,
        frequency: task?.recurring?.frequency || 'WEEKLY',
        interval: task?.recurring?.interval || 1,
        endDate: task?.recurring?.endDate ? task.recurring.endDate.toDate().toISOString().split('T')[0] : '',
        maxOccurrences: task?.recurring?.maxOccurrences || undefined,
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'checklist',
  });

  const handleSubmit = async (data: TaskFormSchemaType) => {
    try {
      setIsSubmitting(true);
      
      const formData: TaskFormData = {
        title: data.title,
        description: data.description,
        priority: data.priority,
        assignedTo: data.assignedTo || undefined,
        assetId: data.assetId || undefined,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        checklist: data.checklist.filter(item => item.trim() !== ''),
        recurring: data.recurring?.enabled && data.recurring.frequency ? {
          frequency: data.recurring.frequency,
          interval: data.recurring.interval || 1,
          endDate: data.recurring.endDate ? new Date(data.recurring.endDate) : undefined,
          maxOccurrences: data.recurring.maxOccurrences,
        } : undefined,
      };

      await onSubmit(formData);
      
      if (!task) {
        form.reset();
        setRecurringEnabled(false);
      }
    } catch (error) {
      console.error('Error submitting task form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addChecklistItem = () => {
    if (fields.length < 20) {
      append('');
    }
  };

  const priorityColors: Record<TaskPriority, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                {...form.register('title')}
                placeholder="Enter task title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(value: TaskPriority) => form.setValue('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      <div className="flex items-center space-x-2">
                        <Badge className={priorityColors[priority]}>
                          {priority}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.priority && (
                <p className="text-sm text-red-500">{form.formState.errors.priority.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetId">Related Asset (Optional)</Label>
              <Select
                value={form.watch('assetId') || ''}
                onValueChange={(value) => form.setValue('assetId', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No asset</SelectItem>
                  {assets.filter(asset => asset.id && asset.id.trim()).map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date (Optional)</Label>
              <Input
                id="dueDate"
                type="date"
                {...form.register('dueDate')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Enter task description"
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-500">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Checklist</Label>
              <Badge variant="secondary">
                {fields.length}/20 items
              </Badge>
            </div>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex space-x-2">
                  <Input
                    {...form.register(`checklist.${index}`)}
                    placeholder={`Checklist item ${index + 1}`}
                    className="flex-1"
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {form.formState.errors.checklist && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.checklist.message}
                </p>
              )}
              {fields.length < 20 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addChecklistItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </div>

          {/* Recurring Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="recurring">Recurring Task</Label>
              <Button
                type="button"
                variant={recurringEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setRecurringEnabled(!recurringEnabled);
                  form.setValue('recurring.enabled', !recurringEnabled);
                }}
              >
                <Repeat className="h-4 w-4 mr-2" />
                {recurringEnabled ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            {recurringEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recurring Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={form.watch('recurring.frequency')}
                        onValueChange={(value) => form.setValue('recurring.frequency', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAILY">Daily</SelectItem>
                          <SelectItem value="WEEKLY">Weekly</SelectItem>
                          <SelectItem value="MONTHLY">Monthly</SelectItem>
                          <SelectItem value="YEARLY">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Interval</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register('recurring.interval', { valueAsNumber: true })}
                        placeholder="Every X periods"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>End Date (Optional)</Label>
                      <Input
                        type="date"
                        {...form.register('recurring.endDate')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Occurrences (Optional)</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register('recurring.maxOccurrences', { valueAsNumber: true })}
                        placeholder="Number of times"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex space-x-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

interface TaskFormDialogProps {
  task?: Task | undefined;
  onSubmit: (data: TaskFormData) => Promise<void>;
  children: React.ReactNode;
}

export const TaskFormDialog: React.FC<TaskFormDialogProps> = ({
  task,
  onSubmit,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: TaskFormData) => {
    await onSubmit(data);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <TaskForm
          task={task}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel={task ? 'Update Task' : 'Create Task'}
        />
      </DialogContent>
    </Dialog>
  );
};