'use client';

import React, { useState, useMemo, memo, lazy, Suspense, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { useTasks } from '@/hooks/useTasks';
import { useAssets } from '@/hooks/useAssets';
import { Task, TaskFilter, TaskSortOptions, TaskFormData, TaskStatus, TaskPriority } from '@/types/task';

// Lazy loading for heavy components
const TaskFormDialog = lazy(() => import('./TaskForm').then(module => ({ default: module.TaskFormDialog })));
const TaskDetailView = lazy(() => import('./TaskDetailView').then(module => ({ default: module.TaskDetailView })));

export const TaskList: React.FC = memo(() => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [sortField, setSortField] = useState<'title' | 'priority' | 'dueDate' | 'createdAt' | 'status'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  const { assets } = useAssets();

  // Build filter and sort options with useMemo for performance
  const filter = useMemo((): TaskFilter => ({
    search: searchTerm || undefined,
    status: selectedStatus.length > 0 ? selectedStatus : undefined,
    priority: selectedPriority.length > 0 ? selectedPriority : undefined,
    assetIds: selectedAsset ? [selectedAsset] : undefined,
  }), [searchTerm, selectedStatus, selectedPriority, selectedAsset]);

  const sort = useMemo((): TaskSortOptions => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection]);

  const { tasks, loading, error, createTask, updateTask, deleteTask, updateTaskStatus } = useTasks(filter, sort);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleCreateTask = useCallback(async (data: TaskFormData) => {
    await createTask(data);
  }, [createTask]);

  const handleEditTask = useCallback((task: Task) => async (data: TaskFormData) => {
    await updateTask(task.id, data);
  }, [updateTask]);

  const handleDeleteTask = useCallback((task: Task) => async () => {
    await deleteTask(task.id);
  }, [deleteTask]);

  const handleStatusChange = useCallback((task: Task) => async (status: TaskStatus) => {
    await updateTaskStatus(task.id, status);
  }, [updateTaskStatus]);

  const handleViewTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailViewOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedStatus([]);
    setSelectedPriority([]);
    setSelectedAsset('');
    setSortField('createdAt');
    setSortDirection('desc');
  }, []);

  const hasActiveFilters = searchTerm || selectedStatus.length > 0 || selectedPriority.length > 0 || 
    selectedAsset || sortField !== 'createdAt' || sortDirection !== 'desc';

  // Task statistics
  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'PENDING').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      overdue: tasks.filter(t => 
        t.dueDate && 
        t.dueDate.toDate() < new Date() && 
        t.status !== 'COMPLETED'
      ).length,
    };
  }, [tasks]);

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>Error loading tasks: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
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
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600 mt-1">Manage maintenance tasks and schedules</p>
        </div>
        <Suspense fallback={<Button disabled><Plus className="h-4 w-4 mr-2" />Loading...</Button>}>
          <TaskFormDialog onSubmit={handleCreateTask}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </TaskFormDialog>
        </Suspense>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
              <div className="text-sm text-gray-600">Overdue</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            Filters & Search
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select 
              value={selectedStatus.join(',')} 
              onValueChange={(value) => setSelectedStatus(value ? value.split(',') as TaskStatus[] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select 
              value={selectedPriority.join(',')} 
              onValueChange={(value) => setSelectedPriority(value ? value.split(',') as TaskPriority[] : [])}
            >
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            {/* Asset Filter */}
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue placeholder="All assets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All assets</SelectItem>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex space-x-2">
              <Select
                value={sortField}
                onValueChange={(value: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'status') => setSortField(value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="dueDate">Due Date</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="flex space-x-2 mb-2">
                  <div className="h-5 bg-gray-200 rounded w-16"></div>
                  <div className="h-5 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : tasks.length === 0 ? (
          // Empty state
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="text-6xl text-gray-300">📋</div>
                <div>
                  <h3 className="text-lg font-semibold">No tasks found</h3>
                  <p className="text-gray-600 mt-2">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or search terms'
                      : 'Get started by creating your first task'
                    }
                  </p>
                </div>
                {!hasActiveFilters && (
                  <Suspense fallback={<Button disabled><Plus className="h-4 w-4 mr-2" />Loading...</Button>}>
                    <TaskFormDialog onSubmit={handleCreateTask}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Task
                      </Button>
                    </TaskFormDialog>
                  </Suspense>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Task list
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask(task)}
              onDelete={handleDeleteTask(task)}
              onView={() => handleViewTask(task)}
              onStatusChange={handleStatusChange(task)}
            />
          ))
        )}
      </div>

      {/* Task Detail View */}
      {selectedTask && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-4 rounded">Loading...</div></div>}>
          <TaskDetailView
            task={selectedTask}
            open={detailViewOpen}
            onOpenChange={setDetailViewOpen}
            onEdit={handleEditTask(selectedTask)}
            onDelete={handleDeleteTask(selectedTask)}
            onStatusChange={handleStatusChange(selectedTask)}
          />
        </Suspense>
      )}
    </div>
  );
});

TaskList.displayName = 'TaskList';