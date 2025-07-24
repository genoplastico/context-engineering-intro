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
import { Plus, Edit, Trash2, Folder, FolderOpen } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { AssetCategory } from '@/types/asset';

const categoryFormSchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

interface CategoryFormProps {
  category?: AssetCategory;
  onSubmit: (data: z.infer<typeof categoryFormSchema>) => Promise<void>;
  onCancel?: () => void;
  availableParents: AssetCategory[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSubmit,
  onCancel,
  availableParents,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof categoryFormSchema>>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      parentId: category?.parentId || 'none',
      color: category?.color || '#3B82F6',
      icon: category?.icon || '📁',
    },
  });

  const handleSubmit = async (data: z.infer<typeof categoryFormSchema>) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      if (!category) {
        form.reset();
      }
    } catch (error) {
      console.error('Error submitting category form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Enter category name"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent">Parent Category</Label>
          <Select
            value={form.watch('parentId') || 'none'}
            onValueChange={(value) => form.setValue('parentId', value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select parent (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No parent (root category)</SelectItem>
              {availableParents
                .filter(p => p.id !== category?.id && p.id && p.id.trim()) // Don't allow self as parent and filter invalid IDs
                .map((parent) => (
                  <SelectItem key={parent.id} value={parent.id}>
                    {parent.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex space-x-2">
            <Input
              id="color"
              type="color"
              {...form.register('color')}
              className="w-16 h-10 p-1"
            />
            <Input
              {...form.register('color')}
              placeholder="#3B82F6"
              className="flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Icon (emoji)</Label>
          <Input
            id="icon"
            {...form.register('icon')}
            placeholder="📁"
            maxLength={4}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Enter category description"
          rows={3}
        />
      </div>

      <div className="flex space-x-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : category ? 'Update Category' : 'Create Category'}
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

interface CategoryTreeItemProps {
  category: AssetCategory & { children?: AssetCategory[] };
  onEdit: (category: AssetCategory) => void;
  onDelete: (category: AssetCategory) => void;
  level: number;
}

const CategoryTreeItem: React.FC<CategoryTreeItemProps> = ({
  category,
  onEdit,
  onDelete,
  level,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
          level > 0 ? 'ml-6 border-l-4' : ''
        }`}
        style={{
          borderLeftColor: level > 0 ? category.color : undefined,
        }}
      >
        <div className="flex items-center space-x-3">
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <FolderOpen className="h-4 w-4" />
              ) : (
                <Folder className="h-4 w-4" />
              )}
            </button>
          )}
          
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-sm"
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </div>
          
          <div>
            <h3 className="font-medium">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasChildren && (
            <Badge variant="secondary">
              {category.children!.length} subcategories
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(category)}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="mt-2 space-y-2">
          {category.children!.map((child) => (
            <CategoryTreeItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryManager: React.FC = () => {
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { categories, loading, error, createCategory, updateCategory, deleteCategory, getCategoryTree } = useCategories();

  const categoryTree = getCategoryTree();

  const handleCreateCategory = async (data: z.infer<typeof categoryFormSchema>) => {
    await createCategory(data);
    setCreateDialogOpen(false);
  };

  const handleEditCategory = async (data: z.infer<typeof categoryFormSchema>) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
      setEditingCategory(null);
      setEditDialogOpen(false);
    }
  };

  const handleDeleteCategory = async (category: AssetCategory) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        alert('Cannot delete category: ' + (error as Error).message);
      }
    }
  };

  const openEditDialog = (category: AssetCategory) => {
    setEditingCategory(category);
    setEditDialogOpen(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>Error loading categories: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-600 mt-1">Organize your assets with hierarchical categories</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleCreateCategory}
              onCancel={() => setCreateDialogOpen(false)}
              availableParents={categories}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Tree</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p>Loading categories...</p>
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl text-gray-300">📁</div>
              <div>
                <h3 className="text-lg font-semibold">No categories yet</h3>
                <p className="text-gray-600 mt-2">Create your first category to organize assets</p>
              </div>
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Category
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryTree.map((category) => (
                <CategoryTreeItem
                  key={category.id}
                  category={category}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteCategory}
                  level={0}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              onSubmit={handleEditCategory}
              onCancel={() => {
                setEditingCategory(null);
                setEditDialogOpen(false);
              }}
              availableParents={categories.filter(c => c.id !== editingCategory.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};