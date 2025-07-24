'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, ChevronLeft, ChevronRight, Calendar, User, Tag, MapPin } from 'lucide-react';
import { Asset } from '@/types/asset';
import { useCategories } from '@/hooks/useCategories';
import { useSpaces } from '@/hooks/useSpaces';
import { AssetFormDialog } from './AssetForm';
import { AssetFormData } from '@/types/asset';
import { format } from 'date-fns';

interface AssetDetailViewProps {
  asset: Asset;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (data: AssetFormData) => Promise<void>;
  onDelete: () => Promise<void>;
}

export const AssetDetailView: React.FC<AssetDetailViewProps> = ({
  asset,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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
      onOpenChange(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === asset.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? asset.images.length - 1 : prev - 1
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{asset.name}</DialogTitle>
            <div className="flex space-x-2">
              <AssetFormDialog asset={asset} onSubmit={handleEdit}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </AssetFormDialog>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          {asset.images.length > 0 && (
            <div className="space-y-4">
              <div className="relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={asset.images[currentImageIndex]}
                  alt={`${asset.name} - Image ${currentImageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                
                {asset.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded">
                      {currentImageIndex + 1} / {asset.images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Image Thumbnails */}
              {asset.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {asset.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-full h-16 bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex
                          ? 'border-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Asset Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {asset.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-gray-600">{asset.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <Badge variant="secondary">
                        {category?.name || 'Unknown'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <Badge variant="outline">
                        {space?.name || 'Unknown'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">
                        {format(asset.createdAt.toDate(), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Created by</p>
                      <p className="font-medium">You</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            {Object.keys(asset.metadata).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Additional Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {Object.entries(asset.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-sm text-gray-500 capitalize font-medium">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm font-medium text-right max-w-[60%] truncate" title={String(value)}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Asset History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Asset created</p>
                      <p className="text-xs text-gray-500">
                        {format(asset.createdAt.toDate(), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                  
                  {asset.updatedAt.toMillis() !== asset.createdAt.toMillis() && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Asset updated</p>
                        <p className="text-xs text-gray-500">
                          {format(asset.updatedAt.toDate(), 'MMM dd, yyyy • h:mm a')}
                        </p>
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