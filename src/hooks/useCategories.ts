'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { orderBy, QueryConstraint } from 'firebase/firestore';
import { OrganizationDB, ORG_COLLECTIONS } from '@/lib/db';
import { AssetCategory } from '@/types/asset';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { useAuth } from './useAuth';
import { nanoid } from 'nanoid';

interface UseCategoriesReturn {
  categories: AssetCategory[];
  loading: boolean;
  error: string | null;
  createCategory: (data: Omit<AssetCategory, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCategory: (id: string, data: Partial<AssetCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryTree: () => AssetCategory[];
  refetch: () => void;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
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

  const fetchCategories = useCallback(async () => {
    if (!orgDB) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
      const fetchedCategories = await orgDB.query<AssetCategory>(
        ORG_COLLECTIONS.CATEGORIES, 
        constraints
      );

      setCategories(fetchedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, [orgDB]);

  const createCategory = async (
    data: Omit<AssetCategory, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      
      const categoryId = nanoid();
      await orgDB.create<AssetCategory>(ORG_COLLECTIONS.CATEGORIES, categoryId, data);
      
      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, data: Partial<AssetCategory>): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      await orgDB.update(ORG_COLLECTIONS.CATEGORIES, id, data);
      
      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      
      // Check if category has children
      const hasChildren = categories.some(cat => cat.parentId === id);
      if (hasChildren) {
        throw new Error('Cannot delete category with subcategories');
      }
      
      await orgDB.delete(ORG_COLLECTIONS.CATEGORIES, id);
      
      // Refresh categories list
      await fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  const getCategoryTree = (): AssetCategory[] => {
    const buildTree = (parentId?: string): AssetCategory[] => {
      return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat,
          children: buildTree(cat.id),
        }));
    };

    return buildTree();
  };

  const refetch = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree,
    refetch,
  };
};