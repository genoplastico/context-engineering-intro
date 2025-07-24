'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { where, orderBy, QueryConstraint } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { OrganizationDB, ORG_COLLECTIONS } from '@/lib/db';
import { Asset, AssetFilter, AssetSortOptions, AssetFormData } from '@/types/asset';
import { useOrganizationContext } from '@/components/providers/OrganizationProvider';
import { useAuth } from './useAuth';
import { nanoid } from 'nanoid';

interface UseAssetsReturn {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  createAsset: (data: AssetFormData) => Promise<void>;
  updateAsset: (id: string, data: Partial<AssetFormData>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  refetch: () => void;
}

export const useAssets = (
  filter?: AssetFilter,
  sort?: AssetSortOptions
): UseAssetsReturn => {
  const [assets, setAssets] = useState<Asset[]>([]);
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

  const buildConstraints = useCallback((): QueryConstraint[] => {
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filter?.categoryIds?.length) {
      constraints.push(where('categoryId', 'in', filter.categoryIds));
    }
    if (filter?.spaceIds?.length) {
      constraints.push(where('spaceId', 'in', filter.spaceIds));
    }
    if (filter?.createdAfter) {
      constraints.push(where('createdAt', '>=', filter.createdAfter));
    }
    if (filter?.createdBefore) {
      constraints.push(where('createdAt', '<=', filter.createdBefore));
    }

    // Apply sorting
    if (sort) {
      constraints.push(orderBy(sort.field, sort.direction));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    return constraints;
  }, [filter, sort]);

  const fetchAssets = useCallback(async () => {
    if (!orgDB) {
      setAssets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const constraints = buildConstraints();
      let fetchedAssets = await orgDB.query<Asset>(ORG_COLLECTIONS.ASSETS, constraints);

      // Apply text search filter (client-side for simplicity)
      if (filter?.search) {
        const searchTerm = filter.search.toLowerCase();
        fetchedAssets = fetchedAssets.filter(asset =>
          asset.name.toLowerCase().includes(searchTerm) ||
          asset.description?.toLowerCase().includes(searchTerm)
        );
      }

      setAssets(fetchedAssets);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  }, [orgDB, buildConstraints, filter?.search]);

  const uploadImages = async (images: File[]): Promise<string[]> => {
    const uploadPromises = images.map(async (image) => {
      const imageId = nanoid();
      const imageRef = ref(storage, `assets/${currentOrganization!.id}/${imageId}`);
      
      await uploadBytes(imageRef, image);
      return await getDownloadURL(imageRef);
    });

    return Promise.all(uploadPromises);
  };

  const deleteImages = async (imageUrls: string[]): Promise<void> => {
    const deletePromises = imageUrls.map(async (url) => {
      try {
        const imageRef = ref(storage, url);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Failed to delete image:', url, error);
      }
    });

    await Promise.all(deletePromises);
  };

  const createAsset = async (data: AssetFormData): Promise<void> => {
    if (!orgDB || !user) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      
      // Upload images
      const imageUrls = await uploadImages(data.images);
      
      // Create asset
      const assetId = nanoid();
      await orgDB.create<Asset>(ORG_COLLECTIONS.ASSETS, assetId, {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        spaceId: data.spaceId,
        images: imageUrls,
        metadata: data.metadata,
      });

      // Refresh assets list
      await fetchAssets();
    } catch (err) {
      console.error('Error creating asset:', err);
      throw err;
    }
  };

  const updateAsset = async (id: string, data: Partial<AssetFormData>): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);

      const updateData: any = { ...data };
      
      // Handle image updates
      if (data.images) {
        // Get current asset to find existing images
        const currentAsset = await orgDB.get<Asset>(ORG_COLLECTIONS.ASSETS, id);
        if (currentAsset?.images) {
          await deleteImages(currentAsset.images);
        }
        
        // Upload new images
        updateData.images = await uploadImages(data.images);
      }

      await orgDB.update(ORG_COLLECTIONS.ASSETS, id, updateData);
      
      // Refresh assets list
      await fetchAssets();
    } catch (err) {
      console.error('Error updating asset:', err);
      throw err;
    }
  };

  const deleteAsset = async (id: string): Promise<void> => {
    if (!orgDB) {
      throw new Error('Not authenticated or no organization selected');
    }

    try {
      setError(null);
      
      // Get asset to find images to delete
      const asset = await orgDB.get<Asset>(ORG_COLLECTIONS.ASSETS, id);
      if (asset?.images) {
        await deleteImages(asset.images);
      }
      
      await orgDB.delete(ORG_COLLECTIONS.ASSETS, id);
      
      // Refresh assets list
      await fetchAssets();
    } catch (err) {
      console.error('Error deleting asset:', err);
      throw err;
    }
  };

  const refetch = useCallback(() => {
    fetchAssets();
  }, [fetchAssets]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  return {
    assets,
    loading,
    error,
    createAsset,
    updateAsset,
    deleteAsset,
    refetch,
  };
};