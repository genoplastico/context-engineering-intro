import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { Asset } from '@/types/asset';
import { format } from 'date-fns';

// WhatsApp sharing utilities
export class WhatsAppService {
  private baseUrl = 'https://wa.me/';
  private webUrl = 'https://web.whatsapp.com/send';

  /**
   * Generate a WhatsApp sharing URL for tasks
   */
  generateTaskShareUrl(task: Task, asset?: Asset, appUrl?: string): string {
    const message = this.formatTaskMessage(task, asset, appUrl);
    return this.createWhatsAppUrl(message);
  }

  /**
   * Generate a WhatsApp sharing URL for assets
   */
  generateAssetShareUrl(asset: Asset, appUrl?: string): string {
    const message = this.formatAssetMessage(asset, appUrl);
    return this.createWhatsAppUrl(message);
  }

  /**
   * Generate deep link URL for mobile app
   */
  generateDeepLink(type: 'task' | 'asset', id: string, appUrl?: string): string {
    const baseAppUrl = appUrl || process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    return `${baseAppUrl}/dashboard/${type}s?id=${id}`;
  }

  /**
   * Format task information for WhatsApp sharing
   */
  private formatTaskMessage(task: Task, asset?: Asset, appUrl?: string): string {
    const statusEmoji = this.getStatusEmoji(task.status);
    const priorityEmoji = this.getPriorityEmoji(task.priority);
    const deepLink = appUrl ? this.generateDeepLink('task', task.id, appUrl) : '';

    let message = `🔧 *Maintenance Task*\n\n`;
    message += `${statusEmoji} *${task.title}*\n`;
    message += `${priorityEmoji} Priority: ${task.priority}\n`;
    message += `📊 Status: ${task.status}\n\n`;

    if (task.description) {
      message += `📝 *Description:*\n${task.description}\n\n`;
    }

    if (asset) {
      message += `🏗️ *Asset:* ${asset.name}\n`;
    }

    if (task.dueDate) {
      const dueDate = task.dueDate.toDate();
      message += `📅 *Due Date:* ${format(dueDate, 'MMM dd, yyyy')}\n`;
    }

    if (task.assignedTo) {
      message += `👤 *Assigned to:* ${task.assignedTo}\n`;
    }

    // Add checklist if exists
    if (task.checklist && task.checklist.length > 0) {
      message += `\n✅ *Checklist:*\n`;
      task.checklist.forEach((item, index) => {
        const checkmark = item.completed ? '✅' : '⬜';
        message += `${checkmark} ${item.text}\n`;
      });
    }

    // Add costs if exists
    if (task.costs && task.costs.length > 0) {
      const totalCost = task.costs.reduce((sum, cost) => sum + cost.amount, 0);
      const currency = task.costs[0]?.currency || 'USD';
      message += `\n💰 *Total Cost:* ${this.formatCurrency(totalCost, currency)}\n`;
    }

    if (deepLink) {
      message += `\n🔗 *View Details:* ${deepLink}\n`;
    }

    message += `\n📱 Shared from Asset Management System`;

    return message;
  }

  /**
   * Format asset information for WhatsApp sharing
   */
  private formatAssetMessage(asset: Asset, appUrl?: string): string {
    const deepLink = appUrl ? this.generateDeepLink('asset', asset.id, appUrl) : '';

    let message = `🏗️ *Asset Information*\n\n`;
    message += `📦 *${asset.name}*\n`;

    if (asset.description) {
      message += `📝 ${asset.description}\n\n`;
    }

    message += `📊 *Details:*\n`;
    message += `🔖 Asset ID: ${asset.id}\n`;
    
    // Add metadata if exists
    if (asset.metadata && Object.keys(asset.metadata).length > 0) {
      message += `\n📋 *Specifications:*\n`;
      Object.entries(asset.metadata).slice(0, 5).forEach(([key, value]) => {
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        message += `• ${formattedKey}: ${value}\n`;
      });
    }

    message += `\n📅 *Created:* ${format(asset.createdAt.toDate(), 'MMM dd, yyyy')}\n`;

    if (deepLink) {
      message += `\n🔗 *View Asset:* ${deepLink}\n`;
    }

    message += `\n📱 Shared from Asset Management System`;

    return message;
  }

  /**
   * Create WhatsApp URL with proper encoding
   */
  private createWhatsAppUrl(message: string, phoneNumber?: string): string {
    const encodedMessage = encodeURIComponent(message);
    
    // Detect if user is on mobile device
    const isMobile = this.isMobileDevice();
    
    if (phoneNumber) {
      // Direct message to specific number
      return `${this.baseUrl}${phoneNumber}?text=${encodedMessage}`;
    } else {
      // Share via WhatsApp (choose contact)
      if (isMobile) {
        return `whatsapp://send?text=${encodedMessage}`;
      } else {
        return `${this.webUrl}?text=${encodedMessage}`;
      }
    }
  }

  /**
   * Get status emoji for task status
   */
  private getStatusEmoji(status: TaskStatus): string {
    const statusEmojis: Record<TaskStatus, string> = {
      PENDING: '⏳',
      IN_PROGRESS: '🔄',
      COMPLETED: '✅',
      CANCELLED: '❌',
    };
    return statusEmojis[status] || '📋';
  }

  /**
   * Get priority emoji for task priority
   */
  private getPriorityEmoji(priority: TaskPriority): string {
    const priorityEmojis: Record<TaskPriority, string> = {
      LOW: '🔵',
      MEDIUM: '🟡',
      HIGH: '🟠',
      URGENT: '🔴',
    };
    return priorityEmojis[priority] || '⚪';
  }

  /**
   * Format currency with proper symbols
   */
  private formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  }

  /**
   * Detect if user is on mobile device
   */
  private isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Open WhatsApp with share intent
   */
  openWhatsApp(url: string): void {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  /**
   * Copy share link to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Generate QR code URL for WhatsApp sharing
   */
  generateQRCodeUrl(message: string): string {
    const whatsappUrl = this.createWhatsAppUrl(message);
    const encodedUrl = encodeURIComponent(whatsappUrl);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();