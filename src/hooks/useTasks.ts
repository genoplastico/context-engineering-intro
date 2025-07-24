'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { where, orderBy, QueryConstraint, Timestamp } from 'firebase/firestore';
import { OrganizationDB, ORG_COLLECTIONS } from '@/lib/db';
import { Task, TaskFilter, TaskSortOptions, TaskFormData, ChecklistItem, TaskCost, TaskStatus } from '@/types/task';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { useAuth } from './useAuth';
import { nanoid } from 'nanoid';

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (data: TaskFormData) => Promise<void>;
  updateTask: (id: string, data: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus, completionNotes?: string) => Promise<void>;
  updateChecklist: (taskId: string, checklist: ChecklistItem[]) => Promise<void>;
  addCost: (taskId: string, cost: Omit<TaskCost, 'id' | 'addedAt' | 'addedBy'>) => Promise<void>;
  removeCost: (taskId: string, costId: string) => Promise<void>;
  refetch: () => void;
}

export const useTasks = (
  filter?: TaskFilter,
  sort?: TaskSortOptions
): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentOrganization } = useOrganizationContext();
  const { user } = useAuth();

  const orgDB = useMemo(() => {
    if (currentOrganization && user) {
      return new OrganizationDB(currentOrganization.id, user.uid);
    }
    return null;
  }, [currentOrganization?.id, user?.uid]);

  const buildConstraints = useCallback((): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filter?.status?.length) {
      constraints.push(where('status', 'in', filter.status));
    }
    if (filter?.priority?.length) {
      constraints.push(where('priority', 'in', filter.priority));
    }
    if (filter?.assignedTo?.length) {
      constraints.push(where('assignedTo', 'in', filter.assignedTo));
    }
    if (filter?.assetIds?.length) {
      constraints.push(where('assetId', 'in', filter.assetIds));
    }
    if (filter?.dueBefore) {
      constraints.push(where('dueDate', '<=', Timestamp.fromDate(filter.dueBefore)));
    }
    if (filter?.dueAfter) {
      constraints.push(where('dueDate', '>=', Timestamp.fromDate(filter.dueAfter)));
    }

    // Apply sorting
    if (sort) {
      constraints.push(orderBy(sort.field, sort.direction));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    return constraints;
  }, [filter, sort]);

  const fetchTasks = useCallback(async () => {
    if (!orgDB) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const constraints = buildConstraints();
      let fetchedTasks = await orgDB.query<Task>(ORG_COLLECTIONS.TASKS, constraints);

      // Apply text search filter (client-side for simplicity)
      if (filter?.search) {
        const searchTerm = filter.search.toLowerCase();
        fetchedTasks = fetchedTasks.filter(task =>
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm) ||
          task.checklist.some(item => item.text.toLowerCase().includes(searchTerm))
        );
      }

      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [orgDB, buildConstraints, filter?.search]);

  const createTask = async (data: TaskFormData): Promise<void> => {
    if (!orgDB || !user) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      
      // Create checklist items
      const checklist: ChecklistItem[] = data.checklist.map(text => ({
        id: nanoid(),
        text,
        completed: false,
      }));

      // Calculate next due date for recurring tasks
      let recurringConfig = undefined;
      if (data.recurring && data.dueDate) {
        recurringConfig = {
          frequency: data.recurring.frequency,
          interval: data.recurring.interval,
          endDate: data.recurring.endDate ? Timestamp.fromDate(data.recurring.endDate) : undefined,
          maxOccurrences: data.recurring.maxOccurrences,
          nextDueDate: Timestamp.fromDate(data.dueDate),
        };
      }

      // Create task
      const taskId = nanoid();
      await orgDB.create<Task>(ORG_COLLECTIONS.TASKS, taskId, {
        title: data.title,
        description: data.description,
        status: 'PENDING' as TaskStatus,
        priority: data.priority,
        assignedTo: data.assignedTo,
        assetId: data.assetId,
        checklist,
        costs: [],
        recurring: recurringConfig,
        dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : undefined,
      });

      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateTask = async (id: string, data: Partial<TaskFormData>): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);

      const updateData: any = { ...data };
      
      // Handle checklist updates
      if (data.checklist) {
        const checklist: ChecklistItem[] = data.checklist.map(text => ({
          id: nanoid(),
          text,
          completed: false,
        }));
        updateData.checklist = checklist;
      }

      // Handle recurring updates
      if (data.recurring && data.dueDate) {
        updateData.recurring = {
          frequency: data.recurring.frequency,
          interval: data.recurring.interval,
          endDate: data.recurring.endDate ? Timestamp.fromDate(data.recurring.endDate) : undefined,
          maxOccurrences: data.recurring.maxOccurrences,
          nextDueDate: Timestamp.fromDate(data.dueDate),
        };
      }

      // Handle due date
      if (data.dueDate) {
        updateData.dueDate = Timestamp.fromDate(data.dueDate);
      }

      await orgDB.update(ORG_COLLECTIONS.TASKS, id, updateData);
      
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      await orgDB.delete(ORG_COLLECTIONS.TASKS, id);
      
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  const updateTaskStatus = async (
    id: string, 
    status: TaskStatus,
    completionNotes?: string
  ): Promise<void> => {
    if (!orgDB || !user) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);

      const updateData: any = { status };
      
      if (status === 'COMPLETED') {
        updateData.completedAt = Timestamp.now();
        updateData.completedBy = user.uid;
        if (completionNotes) {
          updateData.completionNotes = completionNotes;
        }
      } else {
        // Clear completion data if status is changed from completed
        updateData.completedAt = null;
        updateData.completedBy = null;
        updateData.completionNotes = null;
      }

      await orgDB.update(ORG_COLLECTIONS.TASKS, id, updateData);
      
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      throw err;
    }
  };

  const updateChecklist = async (taskId: string, checklist: ChecklistItem[]): Promise<void> => {
    if (!orgDB || !user) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);

      // Update completed timestamps and user info
      const updatedChecklist = checklist.map(item => ({
        ...item,
        completedAt: item.completed && !item.completedAt ? Timestamp.now() : item.completedAt,
        completedBy: item.completed && !item.completedBy ? user.uid : item.completedBy,
      }));

      await orgDB.update(ORG_COLLECTIONS.TASKS, taskId, {
        checklist: updatedChecklist,
      });
      
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error updating checklist:', err);
      throw err;
    }
  };

  const addCost = async (
    taskId: string,
    cost: Omit<TaskCost, 'id' | 'addedAt' | 'addedBy'>
  ): Promise<void> => {
    if (!orgDB || !user) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);

      // Get current task
      const task = await orgDB.get<Task>(ORG_COLLECTIONS.TASKS, taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Add new cost
      const newCost: TaskCost = {
        ...cost,
        id: nanoid(),
        addedAt: Timestamp.now(),
        addedBy: user.uid,
      };

      const updatedCosts = [...task.costs, newCost];

      await orgDB.update(ORG_COLLECTIONS.TASKS, taskId, {
        costs: updatedCosts,
      });
      
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error adding cost:', err);
      throw err;
    }
  };

  const removeCost = async (taskId: string, costId: string): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);

      // Get current task
      const task = await orgDB.get<Task>(ORG_COLLECTIONS.TASKS, taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Remove cost
      const updatedCosts = task.costs.filter(cost => cost.id !== costId);

      await orgDB.update(ORG_COLLECTIONS.TASKS, taskId, {
        costs: updatedCosts,
      });
      
      // Refresh tasks list
      await fetchTasks();
    } catch (err) {
      console.error('Error removing cost:', err);
      throw err;
    }
  };

  const refetch = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateChecklist,
    addCost,
    removeCost,
    refetch,
  };
};