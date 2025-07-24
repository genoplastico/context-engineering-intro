'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, X } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useSpaces } from '@/hooks/useSpaces';
import { Asset, AssetFormData } from '@/types/asset';

const assetFormSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  spaceId: z.string().min(1, 'Space is required'),
  images: z.array(z.instanceof(File)).max(10, 'Maximum 10 images allowed'),
  metadata: z.record(z.any()).optional(),
});

interface AssetFormProps {
  asset?: Asset | undefined;
  onSubmit: (data: AssetFormData) => Promise<void>;
  onCancel?: (() => void) | undefined;
  submitLabel?: string | undefined;
}

export const AssetForm: React.FC<AssetFormProps> = ({
  asset,
  onSubmit,
  onCancel,
  submitLabel = 'Create Asset',
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { categories } = useCategories();
  const { spaces } = useSpaces();

  const form = useForm<z.infer<typeof assetFormSchema>>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: asset?.name || '',
      description: asset?.description || '',
      categoryId: asset?.categoryId || '',
      spaceId: asset?.spaceId || '',
      images: [],
      metadata: asset?.metadata || {},
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length + imageFiles.length > 10) {
      alert('Maximum 10 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    form.setValue('images', [...imageFiles, ...validFiles]);
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    form.setValue('images', newFiles);
  };

  const handleSubmit = async (data: z.infer<typeof assetFormSchema>) => {
    try {
      setIsSubmitting(true);
      
      const formData: AssetFormData = {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        spaceId: data.spaceId,
        images: data.images,
        metadata: data.metadata || {},
      };

      await onSubmit(formData);
      
      if (!asset) {
        form.reset();
        setImageFiles([]);
        setImagePreviews([]);
      }
    } catch (error) {
      console.error('Error submitting asset form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{asset ? 'Edit Asset' : 'Create New Asset'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="Enter asset name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={form.watch('categoryId') || ''}
                onValueChange={(value) => form.setValue('categoryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-500">{form.formState.errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="space">Space</Label>
              <Select
                value={form.watch('spaceId') || ''}
                onValueChange={(value) => form.setValue('spaceId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select space" />
                </SelectTrigger>
                <SelectContent>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.spaceId && (
                <p className="text-sm text-red-500">{form.formState.errors.spaceId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register('description')}
              placeholder="Enter asset description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={imageFiles.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer flex flex-col items-center space-y-2 ${
                  imageFiles.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {imageFiles.length === 0 
                    ? 'Click to upload images or drag and drop' 
                    : `${imageFiles.length}/10 images selected`
                  }
                </p>
                <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
              </label>
            </div>
            
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
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

interface AssetFormDialogProps {
  asset?: Asset;
  onSubmit: (data: AssetFormData) => Promise<void>;
  children: React.ReactNode;
}

export const AssetFormDialog: React.FC<AssetFormDialogProps> = ({
  asset,
  onSubmit,
  children,
}) => {
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: AssetFormData) => {
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
          <DialogTitle>{asset ? 'Edit Asset' : 'Create New Asset'}</DialogTitle>
        </DialogHeader>
        <AssetForm
          asset={asset}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          submitLabel={asset ? 'Update Asset' : 'Create Asset'}
        />
      </DialogContent>
    </Dialog>
  );
};