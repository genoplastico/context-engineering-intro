import { Timestamp } from 'firebase/firestore';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Timestamp;
  completedBy?: string;
}

export interface TaskCost {
  id: string;
  amount: number;
  currency: string;
  description?: string;
  receipt?: string; // Firebase Storage URL
  addedAt: Timestamp;
  addedBy: string;
}

export interface RecurringConfig {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number; // Every N days/weeks/months/years
  endDate?: Timestamp;
  maxOccurrences?: number;
  nextDueDate: Timestamp;
}

export interface Task {
  id: string;
  organizationId: string;
  assetId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  checklist: ChecklistItem[];
  costs: TaskCost[];
  recurring?: RecurringConfig;
  dueDate?: Timestamp;
  completedAt?: Timestamp;
  completedBy?: string;
  completionNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo?: string;
  assetId?: string;
  dueDate?: Date;
  checklist: string[];
  recurring?: {
    frequency: RecurringConfig['frequency'];
    interval: number;
    endDate?: Date;
    maxOccurrences?: number;
  };
}

export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignedTo?: string[];
  assetIds?: string[];
  dueBefore?: Date;
  dueAfter?: Date;
  search?: string;
}

export interface TaskSortOptions {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'status';
  direction: 'asc' | 'desc';
}

export interface Suggestion {
  id: string;
  organizationId: string;
  assetId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  estimatedCost?: number;
  aiGenerated: true;
  createdAt: Timestamp;
}