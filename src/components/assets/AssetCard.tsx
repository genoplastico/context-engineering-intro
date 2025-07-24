'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatsAppQuickShare } from '@/components/ui/whatsapp-share';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { Asset } from '@/types/asset';
import { useCategories } from '@/hooks/useCategories';
import { useSpaces } from '@/hooks/useSpaces';
import { AssetFormDialog } from './AssetForm';
import { format } from 'date-fns';

interface AssetCardProps {
  asset: Asset;
  onEdit: (data: AssetFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  onView?: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = memo(({
  asset,
  onEdit,
  onDelete,
  onView,
}) => {
  const { categories } = useCategories();
  const { spaces } = useSpaces();

  const category = categories.find(c => c.id === asset.categoryId);
  const space = spaces.find(s => s.id === asset.spaceId);

  const handleEdit = async (data: AssetFormData) => {
    await onEdit(data);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      await onDelete();
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {asset.name}
            </CardTitle>
            {asset.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {asset.description}
              </p>
            )}
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onView && (
              <Button variant="ghost" size="sm" onClick={onView}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <WhatsAppQuickShare asset={asset} />
            <AssetFormDialog asset={asset} onSubmit={handleEdit}>
              <Button variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </AssetFormDialog>
            <Button variant="ghost" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Asset Image */}
        {asset.images.length > 0 && (
          <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={asset.images[0]}
              alt={asset.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {asset.images.length > 1 && (
              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                +{asset.images.length - 1} more
              </div>
            )}
          </div>
        )}

        {/* Asset Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {category && (
              <Badge variant="secondary" className="text-xs">
                {category.name}
              </Badge>
            )}
            {space && (
              <Badge variant="outline" className="text-xs">
                📍 {space.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>
                {format(asset.createdAt.toDate(), 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>Created by you</span>
            </div>
          </div>

          {/* Metadata */}
          {Object.keys(asset.metadata).length > 0 && (
            <div className="pt-2 border-t">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(asset.metadata).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500 capitalize">{key}:</span>
                    <span className="truncate ml-1" title={String(value)}>
                      {String(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(asset.metadata).length > 4 && (
                  <div className="col-span-2 text-center text-gray-400">
                    +{Object.keys(asset.metadata).length - 4} more fields
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

AssetCard.displayName = 'AssetCard';