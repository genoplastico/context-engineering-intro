'use client';

import * as XLSX from 'xlsx';
import { ics, ICalendarComponent } from 'ics';
import { Task, TaskCost } from '@/types/task';
import { Asset } from '@/types/asset';
import { format } from 'date-fns';

export interface ExportData {
  tasks: Task[];
  assets: Asset[];
  organizationName: string;
}

export interface CostReportData {
  taskId: string;
  taskTitle: string;
  assetName?: string;
  costs: TaskCost[];
  totalCost: number;
}

// Excel Export Functions
export const exportCostsToExcel = (data: ExportData): void => {
  try {
    // Prepare cost data
    const costData: any[] = [];
    
    data.tasks.forEach(task => {
      const asset = data.assets.find(a => a.id === task.assetId);
      
      if (task.costs.length > 0) {
        task.costs.forEach(cost => {
          costData.push({
            'Task Title': task.title,
            'Asset Name': asset?.name || 'No Asset',
            'Description': cost.description || '',
            'Amount': cost.amount,
            'Currency': cost.currency,
            'Date Added': format(cost.addedAt.toDate(), 'yyyy-MM-dd'),
            'Task Status': task.status,
            'Task Priority': task.priority,
            'Due Date': task.dueDate ? format(task.dueDate.toDate(), 'yyyy-MM-dd') : '',
            'Completed Date': task.completedAt ? format(task.completedAt.toDate(), 'yyyy-MM-dd') : '',
          });
        });
      } else {
        // Include tasks with no costs for completeness
        costData.push({
          'Task Title': task.title,
          'Asset Name': asset?.name || 'No Asset',
          'Description': '',
          'Amount': 0,
          'Currency': 'USD',
          'Date Added': '',
          'Task Status': task.status,
          'Task Priority': task.priority,
          'Due Date': task.dueDate ? format(task.dueDate.toDate(), 'yyyy-MM-dd') : '',
          'Completed Date': task.completedAt ? format(task.completedAt.toDate(), 'yyyy-MM-dd') : '',
        });
      }
    });

    // Create summary data
    const summaryData = [
      { 'Metric': 'Total Tasks', 'Value': data.tasks.length },
      { 'Metric': 'Tasks with Costs', 'Value': data.tasks.filter(t => t.costs.length > 0).length },
      { 'Metric': 'Total Cost Records', 'Value': data.tasks.reduce((sum, t) => sum + t.costs.length, 0) },
      { 'Metric': 'Total Amount (USD)', 'Value': data.tasks.reduce((sum, t) => sum + t.costs.reduce((tSum, c) => tSum + c.amount, 0), 0) },
      { 'Metric': 'Completed Tasks', 'Value': data.tasks.filter(t => t.status === 'COMPLETED').length },
      { 'Metric': 'Pending Tasks', 'Value': data.tasks.filter(t => t.status === 'PENDING').length },
      { 'Metric': 'In Progress Tasks', 'Value': data.tasks.filter(t => t.status === 'IN_PROGRESS').length },
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Add cost details sheet
    const wsDetails = XLSX.utils.json_to_sheet(costData);
    XLSX.utils.book_append_sheet(wb, wsDetails, 'Cost Details');
    
    // Add summary sheet
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Generate and download file
    const fileName = `${data.organizationName.replace(/[^a-zA-Z0-9]/g, '_')}_costs_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting costs to Excel:', error);
    throw new Error('Failed to export cost data');
  }
};

export const exportAssetsToExcel = (data: ExportData): void => {
  try {
    // Prepare asset data
    const assetData = data.assets.map(asset => ({
      'Asset Name': asset.name,
      'Description': asset.description || '',
      'Category': '', // Would need category lookup
      'Space': '', // Would need space lookup
      'Created Date': format(asset.createdAt.toDate(), 'yyyy-MM-dd'),
      'Updated Date': format(asset.updatedAt.toDate(), 'yyyy-MM-dd'),
      'Images Count': asset.images.length,
      'Metadata': JSON.stringify(asset.metadata),
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(assetData);
    XLSX.utils.book_append_sheet(wb, ws, 'Assets');

    // Generate and download file
    const fileName = `${data.organizationName.replace(/[^a-zA-Z0-9]/g, '_')}_assets_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting assets to Excel:', error);
    throw new Error('Failed to export asset data');
  }
};

export const exportTasksToExcel = (data: ExportData): void => {
  try {
    // Prepare task data
    const taskData = data.tasks.map(task => {
      const asset = data.assets.find(a => a.id === task.assetId);
      const totalCost = task.costs.reduce((sum, cost) => sum + cost.amount, 0);
      const completedChecklist = task.checklist.filter(item => item.completed).length;
      
      return {
        'Task Title': task.title,
        'Description': task.description,
        'Status': task.status,
        'Priority': task.priority,
        'Asset Name': asset?.name || 'No Asset',
        'Assigned To': task.assignedTo || 'Unassigned',
        'Due Date': task.dueDate ? format(task.dueDate.toDate(), 'yyyy-MM-dd') : '',
        'Created Date': format(task.createdAt.toDate(), 'yyyy-MM-dd'),
        'Completed Date': task.completedAt ? format(task.completedAt.toDate(), 'yyyy-MM-dd') : '',
        'Checklist Progress': `${completedChecklist}/${task.checklist.length}`,
        'Total Cost': totalCost,
        'Is Recurring': task.recurring ? 'Yes' : 'No',
        'Completion Notes': task.completionNotes || '',
      };
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(taskData);
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

    // Generate and download file
    const fileName = `${data.organizationName.replace(/[^a-zA-Z0-9]/g, '_')}_tasks_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  } catch (error) {
    console.error('Error exporting tasks to Excel:', error);
    throw new Error('Failed to export task data');
  }
};

// Calendar Export Functions
export const exportTasksToCalendar = (data: ExportData): void => {
  try {
    const events: ICalendarComponent[] = [];

    data.tasks.forEach(task => {
      // Only export tasks with due dates
      if (task.dueDate) {
        const asset = data.assets.find(a => a.id === task.assetId);
        const dueDate = task.dueDate.toDate();
        
        const event: ICalendarComponent = {
          start: [
            dueDate.getFullYear(),
            dueDate.getMonth() + 1,
            dueDate.getDate(),
            dueDate.getHours(),
            dueDate.getMinutes()
          ],
          startInputType: 'utc',
          title: task.title,
          description: `${task.description}\n\nAsset: ${asset?.name || 'No Asset'}\nPriority: ${task.priority}\nStatus: ${task.status}`,
          status: task.status === 'COMPLETED' ? 'CONFIRMED' : 'TENTATIVE',
          categories: [task.priority, 'Maintenance'],
          uid: task.id,
        };

        // Add recurring rule if task is recurring
        if (task.recurring) {
          const freq = task.recurring.frequency;
          const interval = task.recurring.interval;
          
          let rruleFreq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
          switch (freq) {
            case 'DAILY':
              rruleFreq = 'DAILY';
              break;
            case 'WEEKLY':
              rruleFreq = 'WEEKLY';
              break;
            case 'MONTHLY':
              rruleFreq = 'MONTHLY';
              break;
            case 'YEARLY':
              rruleFreq = 'YEARLY';
              break;
            default:
              rruleFreq = 'WEEKLY';
          }

          event.recurrenceRule = {
            freq: rruleFreq,
            interval: interval,
            ...(task.recurring.endDate && {
              until: [
                task.recurring.endDate.toDate().getFullYear(),
                task.recurring.endDate.toDate().getMonth() + 1,
                task.recurring.endDate.toDate().getDate()
              ]
            }),
            ...(task.recurring.maxOccurrences && {
              count: task.recurring.maxOccurrences
            })
          };
        }

        events.push(event);
      }
    });

    // Generate calendar file
    const { error, value } = ics.createEvents(events);
    
    if (error) {
      console.error('Error creating calendar:', error);
      throw new Error('Failed to create calendar file');
    }

    if (value) {
      // Create and download file
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${data.organizationName.replace(/[^a-zA-Z0-9]/g, '_')}_maintenance_schedule_${format(new Date(), 'yyyy-MM-dd')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting tasks to calendar:', error);
    throw new Error('Failed to export maintenance schedule');
  }
};

// Utility function to generate CSV
export const exportToCSV = (data: any[], filename: string): void => {
  try {
    if (data.length === 0) {
      throw new Error('No data to export');
    }

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export CSV file');
  }
};