import { Timestamp } from 'firebase/firestore';

export interface Asset {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  categoryId: string;
  spaceId: string;
  images: string[]; // Firebase Storage URLs
  metadata: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

export interface AssetCategory {
  id: string;
  organizationId: string;
  name: string;
  description?: string | undefined;
  parentId?: string | undefined; // For hierarchical categories
  color?: string | undefined;
  icon?: string | undefined;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  children?: AssetCategory[] | undefined; // For tree structure
}

export interface AssetSpace {
  id: string;
  organizationId: string;
  name: string;
  description?: string | undefined;
  parentId?: string | undefined; // For hierarchical spaces
  location?: {
    address?: string | undefined;
    coordinates?: {
      lat: number;
      lng: number;
    } | undefined;
  } | undefined;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  children?: AssetSpace[] | undefined; // For tree structure
}

export interface AssetFilter {
  categoryIds?: string[] | undefined;
  spaceIds?: string[] | undefined;
  search?: string | undefined;
  createdAfter?: Date | undefined;
  createdBefore?: Date | undefined;
}

export interface AssetSortOptions {
  field: 'name' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface AssetFormData {
  name: string;
  description?: string | undefined;
  categoryId: string;
  spaceId: string;
  images: File[];
  metadata: Record<string, any>;
}