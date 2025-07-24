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
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MapPin, Building, ChevronRight } from 'lucide-react';
import { useSpaces } from '@/hooks/useSpaces';
import { AssetSpace } from '@/types/asset';

const spaceFormSchema = z.object({
  name: z.string().min(1, 'Space name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  location: z.object({
    address: z.string().optional(),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    }).optional(),
  }).optional(),
});

interface SpaceFormProps {
  space?: AssetSpace;
  onSubmit: (data: z.infer<typeof spaceFormSchema>) => Promise<void>;
  onCancel?: () => void;
  availableParents: AssetSpace[];
}

const SpaceForm: React.FC<SpaceFormProps> = ({
  space,
  onSubmit,
  onCancel,
  availableParents,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof spaceFormSchema>>({
    resolver: zodResolver(spaceFormSchema),
    defaultValues: {
      name: space?.name || '',
      description: space?.description || '',
      parentId: space?.parentId || 'none',
      location: {
        address: space?.location?.address || '',
        coordinates: {
          lat: space?.location?.coordinates?.lat || undefined,
          lng: space?.location?.coordinates?.lng || undefined,
        },
      },
    },
  });

  const handleSubmit = async (data: z.infer<typeof spaceFormSchema>) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      if (!space) {
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting space form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Space Name</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Enter space name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent">Parent Space</Label>
          <Select
            value={form.watch('parentId') || 'none'}
            onValueChange={(value) => form.setValue('parentId', value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No parent (root space)</SelectItem>
              {availableParents
                .filter(p => p.id !== space?.id && p.id && p.id.trim()) // Don't allow self as parent and filter invalid IDs
                .map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Enter space description"
          rows={3}
        />
      </div>

      <div className="space-y-4">
        <Label>Location</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...form.register('location.address')}
              placeholder="Enter address"
            />
          </div>
          <div className="space-y-2">
            <Label>Coordinates</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                {...form.register('location.coordinates.lat', { valueAsNumber: true })}
                placeholder="Latitude"
                type="number"
                step="any"
              />
              <Input
                {...form.register('location.coordinates.lng', { valueAsNumber: true })}
                placeholder="Longitude"
                type="number"
                step="any"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : space ? 'Update Space' : 'Create Space'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

interface SpaceTreeItemProps {
  space: AssetSpace & { children?: AssetSpace[] };
  onEdit: (space: AssetSpace) => void;
  onDelete: (space: AssetSpace) => void;
  level: number;
  path: string[];
}

const SpaceTreeItem: React.FC<SpaceTreeItemProps> = ({
  space,
  onEdit,
  onDelete,
  level,
  path,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = space.children && space.children.length > 0;
  const currentPath = [...path, space.name];

  return (
    <div>
      <div
        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
          level > 0 ? 'ml-6 border-l-4 border-l-blue-200' : ''
        }`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded flex-shrink-0"
            >
              <Building className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </button>
          )}
          
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1 text-sm text-gray-500 mb-1">
                {currentPath.map((pathItem, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="h-3 w-3" />}
                    <span className={index === currentPath.length - 1 ? 'font-medium text-gray-900' : ''}>
                      {pathItem}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              {space.description && (
                <p className="text-sm text-gray-600 truncate">{space.description}</p>
              )}
              {space.location?.address && (
                <p className="text-xs text-gray-500 truncate">📍 {space.location.address}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {hasChildren && (
            <Badge variant="secondary">
              {space.children!.length} sub-spaces
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(space)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(space)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {space.children!.map((child) => (
            <SpaceTreeItem
              key={child.id}
              space={child}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const SpaceManager: React.FC = () => {
  const [editingSpace, setEditingSpace] = useState<AssetSpace | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  console.log('🏢 SpaceManager component rendered');
  
  const { spaces, loading, error, createSpace, updateSpace, deleteSpace, getSpaceTree } = useSpaces();

  const spaceTree = getSpaceTree();

  console.log('🏢 SpaceManager render:', {
    spacesCount: spaces.length,
    loading,
    error,
    spaceTreeCount: spaceTree.length,
    spaces: spaces.map(s => ({ id: s.id, name: s.name })),
    spaceTree: spaceTree.map(s => ({ id: s.id, name: s.name, childrenCount: s.children?.length || 0 }))
  });

  const handleCreateSpace = async (data: z.infer<typeof spaceFormSchema>) => {
    // Clean up parentId - if it's 'none', convert to undefined
    const cleanedData = {
      ...data,
      parentId: data.parentId === 'none' ? undefined : data.parentId
    };
    await createSpace(cleanedData);
    setCreateDialogOpen(false);
  };

  const handleEditSpace = async (data: z.infer<typeof spaceFormSchema>) => {
    if (editingSpace) {
      // Clean up parentId - if it's 'none', convert to undefined
      const cleanedData = {
        ...data,
        parentId: data.parentId === 'none' ? undefined : data.parentId
      };
      await updateSpace(editingSpace.id, cleanedData);
      setEditingSpace(null);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteSpace = async (space: AssetSpace) => {
    if (window.confirm(`Are you sure you want to delete "${space.name}"?`)) {
      try {
        await deleteSpace(space.id);
      } catch (error) {
        alert('Cannot delete space: ' + (error as Error).message);
      }
    }
  };

  const openEditDialog = (space: AssetSpace) => {
    setEditingSpace(space);
    setEditDialogOpen(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>Error loading spaces: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spaces</h1>
          <p className="text-gray-600 mt-1">Organize your assets by physical locations and spaces</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Space
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Space</DialogTitle>
            </DialogHeader>
            <SpaceForm
              onSubmit={handleCreateSpace}
              onCancel={() => setCreateDialogOpen(false)}
              availableParents={spaces}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Space Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading spaces...</p>
            </div>
          ) : spaceTree.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl text-gray-300">🏢</div>
              <div>
                <h3 className="text-lg font-semibold">No spaces yet</h3>
                <p className="text-gray-600 mt-2">Create your first space to organize assets by location</p>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Space
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-3">
              {spaceTree.map((space) => (
                <SpaceTreeItem
                  key={space.id}
                  space={space}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteSpace}
                  level={0}
                  path={[]}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Space Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Space</DialogTitle>
          </DialogHeader>
          {editingSpace && (
            <SpaceForm
              space={editingSpace}
              onSubmit={handleEditSpace}
              onCancel={() => {
                setEditingSpace(null);
                setEditDialogOpen(false);
              }}
              availableParents={spaces.filter(s => s.id !== editingSpace.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};