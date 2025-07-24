'use client';

import React, { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Copy, 
  QrCode, 
  ExternalLink,
  Check,
  Share
} from 'lucide-react';
import { whatsappService } from '@/lib/whatsapp';
import { Task } from '@/types/task';
import { Asset } from '@/types/asset';

interface WhatsAppShareProps {
  task?: Task;
  asset?: Asset;
  children?: React.ReactNode;
  variant?: 'button' | 'icon' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export const WhatsAppShare: React.FC<WhatsAppShareProps> = memo(({
  task,
  asset,
  children,
  variant = 'button',
  size = 'md',
}) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Generate share URL and message
  const shareUrl = task 
    ? whatsappService.generateTaskShareUrl(task, asset)
    : asset 
    ? whatsappService.generateAssetShareUrl(asset)
    : '';

  const shareMessage = task
    ? `Check out this maintenance task: ${task.title}`
    : asset
    ? `Check out this asset: ${asset.name}`
    : '';

  const deepLink = task
    ? whatsappService.generateDeepLink('task', task.id)
    : asset
    ? whatsappService.generateDeepLink('asset', asset.id)
    : '';

  const qrCodeUrl = whatsappService.generateQRCodeUrl(shareUrl);

  const handleWhatsAppShare = () => {
    whatsappService.openWhatsApp(shareUrl);
    setOpen(false);
  };

  const handleCopyLink = async () => {
    const success = await whatsappService.copyToClipboard(deepLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyMessage = async () => {
    const message = task 
      ? whatsappService['formatTaskMessage'](task, asset)
      : asset 
      ? whatsappService['formatAssetMessage'](asset)
      : shareMessage;
    
    const success = await whatsappService.copyToClipboard(message);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderTrigger = () => {
    if (children) {
      return children;
    }

    const buttonProps = {
      size: size === 'sm' ? 'sm' as const : size === 'lg' ? 'lg' as const : 'default' as const,
      variant: 'outline' as const,
    };

    switch (variant) {
      case 'icon':
        return (
          <Button {...buttonProps} className="p-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
          </Button>
        );
      case 'text':
        return (
          <Button {...buttonProps} variant="ghost">
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            Share
          </Button>
        );
      default:
        return (
          <Button {...buttonProps}>
            <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
            Share via WhatsApp
          </Button>
        );
    }
  };

  if (!task && !asset) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {renderTrigger()}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Share via WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview */}
          <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Preview:</div>
            <div className="font-medium">
              {task ? `🔧 ${task.title}` : asset ? `🏗️ ${asset.name}` : ''}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {task ? `Status: ${task.status} • Priority: ${task.priority}` : ''}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleWhatsAppShare}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Open WhatsApp
            </Button>
            
            <Button
              onClick={handleCopyLink}
              variant="outline"
              size="sm"
              disabled={copied}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Additional Options */}
          <div className="flex justify-between items-center pt-2 border-t">
            <Button
              onClick={handleCopyMessage}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Message
            </Button>
            
            <Button
              onClick={() => setShowQR(!showQR)}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
            
            <Button
              onClick={() => window.open(deepLink, '_blank')}
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="text-center p-4 bg-white border rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Scan to share on mobile</div>
              <img
                src={qrCodeUrl}
                alt="WhatsApp Share QR Code"
                className="mx-auto border rounded"
                width={160}
                height={160}
              />
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-start">
          <div className="text-xs text-gray-500">
            💡 Recipients can view full details by clicking the shared link
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

WhatsAppShare.displayName = 'WhatsAppShare';

// Quick share button for inline use
export const WhatsAppQuickShare: React.FC<{
  task?: Task;
  asset?: Asset;
  className?: string;
}> = memo(({ task, asset, className = '' }) => {
  const handleQuickShare = () => {
    const shareUrl = task 
      ? whatsappService.generateTaskShareUrl(task, asset)
      : asset 
      ? whatsappService.generateAssetShareUrl(asset)
      : '';
    
    if (shareUrl) {
      whatsappService.openWhatsApp(shareUrl);
    }
  };

  if (!task && !asset) {
    return null;
  }

  return (
    <Button
      onClick={handleQuickShare}
      variant="ghost"
      size="sm"
      className={`text-green-600 hover:text-green-700 hover:bg-green-50 ${className}`}
    >
      <MessageCircle className="h-4 w-4" />
    </Button>
  );
});

WhatsAppQuickShare.displayName = 'WhatsAppQuickShare';