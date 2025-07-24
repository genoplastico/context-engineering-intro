'use client';

import React, { useState, useMemo, memo, lazy, Suspense, useCallback } from 'react'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Grid, List, Filter, SortAsc, SortDesc } from 'lucide-react';
import { AssetCard } from './AssetCard';
import { useAssets } from '@/hooks/useAssets';
import { useCategories } from '@/hooks/useCategories';
import { useSpaces } from '@/hooks/useSpaces';
import { Asset, AssetFilter, AssetSortOptions, AssetFormData } from '@/types/asset';

// Lazy loading for heavy components
const AssetFormDialog = lazy(() => import('./AssetForm').then(module => ({ default: module.AssetFormDialog })));
const AssetDetailView = lazy(() => import('./AssetDetailView').then(module => ({ default: module.AssetDetailView })));

type ViewMode = 'grid' | 'list';

export const AssetList: React.FC = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  const [sortField, setSortField] = useState<'name' | 'createdAt' | 'updatedAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  const { categories } = useCategories();
  const { spaces } = useSpaces();

  // Build filter and sort options with useMemo for performance
  const filter = useMemo((): AssetFilter => ({
    search: searchTerm || undefined,
    categoryIds: selectedCategory ? [selectedCategory] : undefined,
    spaceIds: selectedSpace ? [selectedSpace] : undefined,
  }), [searchTerm, selectedCategory, selectedSpace]);

  const sort = useMemo((): AssetSortOptions => ({
    field: sortField,
    direction: sortDirection,
  }), [sortField, sortDirection]);

  const { assets, loading, error, createAsset, updateAsset, deleteAsset } = useAssets(filter, sort);

  // Memoized callbacks to prevent unnecessary re-renders
  const handleCreateAsset = useCallback(async (data: AssetFormData) => {
    await createAsset(data);
  }, [createAsset]);

  const handleEditAsset = useCallback((asset: Asset) => async (data: AssetFormData) => {
    await updateAsset(asset.id, data);
  }, [updateAsset]);

  const handleDeleteAsset = useCallback((asset: Asset) => async () => {
    await deleteAsset(asset.id);
  }, [deleteAsset]);

  const handleViewAsset = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setDetailViewOpen(true);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSpace('');
    setSortField('createdAt');
    setSortDirection('desc');
  }, []);

  const hasActiveFilters = searchTerm || selectedCategory || selectedSpace || 
    sortField !== 'createdAt' || sortDirection !== 'desc';

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-red-500">
            <p>Error loading assets: {error}</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Assets</h1>
          <p className="text-gray-600 mt-1">Manage your organization's assets</p>
        </div>
        <Suspense fallback={<Button disabled><Plus className="h-4 w-4 mr-2" />Loading...</Button>}>
          <AssetFormDialog onSubmit={handleCreateAsset}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </AssetFormDialog>
        </Suspense>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <CardTitle className="text-lg">
              Filters & Search
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Space Filter */}
            <Select value={selectedSpace} onValueChange={setSelectedSpace}>
              <SelectTrigger>
                <SelectValue placeholder="All spaces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All spaces</SelectItem>
                {spaces.map((space) => (
                  <SelectItem key={space.id} value={space.id}>
                    {space.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex space-x-2">
              <Select
                value={sortField}
                onValueChange={(value: 'name' | 'createdAt' | 'updatedAt') => setSortField(value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="updatedAt">Updated</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Asset Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? 'Loading...' : `${assets.length} asset${assets.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Asset Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {loading ? (
          // Loading skeleton
          Array.from({ length: 8 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : assets.length === 0 ? (
          // Empty state
          <Card className="col-span-full">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="text-6xl text-gray-300">📦</div>
                <div>
                  <h3 className="text-lg font-semibold">No assets found</h3>
                  <p className="text-gray-600 mt-2">
                    {hasActiveFilters 
                      ? 'Try adjusting your filters or search terms'
                      : 'Get started by creating your first asset'
                    }
                  </p>
                </div>
                {!hasActiveFilters && (
                  <Suspense fallback={<Button disabled><Plus className="h-4 w-4 mr-2" />Loading...</Button>}>
                    <AssetFormDialog onSubmit={handleCreateAsset}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Asset
                      </Button>
                    </AssetFormDialog>
                  </Suspense>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Asset list
          assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onEdit={handleEditAsset(asset)}
              onDelete={handleDeleteAsset(asset)}
              onView={() => handleViewAsset(asset)}
            />
          ))
        )}
      </div>

      {/* Asset Detail View */}
      {selectedAsset && (
        <Suspense fallback={<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"><div className="bg-white p-4 rounded">Loading...</div></div>}>
          <AssetDetailView
            asset={selectedAsset}
            open={detailViewOpen}
            onOpenChange={setDetailViewOpen}
            onEdit={handleEditAsset(selectedAsset)}
            onDelete={handleDeleteAsset(selectedAsset)}
          />
        </Suspense>
      )}
    </div>
  );
});

AssetList.displayName = 'AssetList';