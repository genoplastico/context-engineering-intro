'use client';

import { useState, useEffect, useCallback } from 'react';
import { orderBy, QueryConstraint } from 'firebase/firestore';
import { OrganizationDB, ORG_COLLECTIONS } from '@/lib/db';
import { AssetSpace } from '@/types/asset';
import { useOrganization } from './useOrganization';
import { useAuth } from './useAuth';
import { nanoid } from 'nanoid';

interface UseSpacesReturn {
  spaces: AssetSpace[];
  loading: boolean;
  error: string | null;
  createSpace: (data: Omit<AssetSpace, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSpace: (id: string, data: Partial<AssetSpace>) => Promise<void>;
  deleteSpace: (id: string) => Promise<void>;
  getSpaceTree: () => AssetSpace[];
  refetch: () => void;
}

export const useSpaces = (): UseSpacesReturn => {
  const [spaces, setSpaces] = useState<AssetSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { currentOrganization } = useOrganization();
  const { user } = useAuth();

  const orgDB = currentOrganization && user 
    ? new OrganizationDB(currentOrganization.id, user.uid)
    : null;

  const fetchSpaces = useCallback(async () => {
    if (!orgDB) {
      setSpaces([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
      const fetchedSpaces = await orgDB.query<AssetSpace>(
        ORG_COLLECTIONS.SPACES, 
        constraints
      );

      setSpaces(fetchedSpaces);
    } catch (err) {
      console.error('Error fetching spaces:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch spaces');
    } finally {
      setLoading(false);
    }
  }, [orgDB]);

  const createSpace = async (
    data: Omit<AssetSpace, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      
      const spaceId = nanoid();
      await orgDB.create<AssetSpace>(ORG_COLLECTIONS.SPACES, spaceId, data);
      
      // Refresh spaces list
      await fetchSpaces();
    } catch (err) {
      console.error('Error creating space:', err);
      throw err;
    }
  };

  const updateSpace = async (id: string, data: Partial<AssetSpace>): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      await orgDB.update(ORG_COLLECTIONS.SPACES, id, data);
      
      // Refresh spaces list
      await fetchSpaces();
    } catch (err) {
      console.error('Error updating space:', err);
      throw err;
    }
  };

  const deleteSpace = async (id: string): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      
      // Check if space has children
      const hasChildren = spaces.some(space => space.parentId === id);
      if (hasChildren) {
        throw new Error('Cannot delete space with sub-spaces');
      }
      
      await orgDB.delete(ORG_COLLECTIONS.SPACES, id);
      
      // Refresh spaces list
      await fetchSpaces();
    } catch (err) {
      console.error('Error deleting space:', err);
      throw err;
    }
  };

  const getSpaceTree = (): AssetSpace[] => {
    const buildTree = (parentId?: string): AssetSpace[] => {
      return spaces
        .filter(space => space.parentId === parentId)
        .map(space => ({
          ...space,
          children: buildTree(space.id),
        }));
    };

    return buildTree();
  };

  const refetch = useCallback(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  useEffect(() => {
    fetchSpaces();
  }, [fetchSpaces]);

  return {
    spaces,
    loading,
    error,
    createSpace,
    updateSpace,
    deleteSpace,
    getSpaceTree,
    refetch,
  };
};