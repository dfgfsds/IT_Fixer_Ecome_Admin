import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Layers, Sliders, X, Loader2, Filter } from 'lucide-react';
import Button from '../../components/Button';
import SearchInput from '../../components/Search';
import { Pagination } from '../Pagination';
import {
  getCategoryAttributesApi,
  getPcCategoriesApi,
  getAttributesApi,
  deleteCategoryAttributeApi,
} from '../../Api-Service/Apis';
import { CategoryAttribute } from '../../types/categoryAttribute';
import CategoryAttributeModal from '../../components/category-attributes/CategoryAttributeModal';
import { toast } from 'react-toastify';
import EmptyBox from '../../assets/image/empty-box.png';

export default function CategoryAttributes() {
  const { id: vendorId } = useParams<{ id: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryAttribute | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<CategoryAttribute | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [selectedAttributeFilter, setSelectedAttributeFilter] = useState('');
  const [requiredFilter, setRequiredFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Categories & Attributes for filters
  const { data: categoriesRes } = useQuery({
    queryKey: ['getPcCategoriesDataForSelect'],
    queryFn: () => getPcCategoriesApi('?per_page=100'),
  });

  const { data: attributesRes } = useQuery({
    queryKey: ['getAttributesDataForSelect'],
    queryFn: () => getAttributesApi('?per_page=100'),
  });

  const categoriesList: any[] = categoriesRes?.data?.data || categoriesRes?.data || [];
  const attributesList: any[] = attributesRes?.data?.data || attributesRes?.data || [];

  // Construct Query String for Category Attributes API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('per_page', String(itemsPerPage));
    params.append('current_page', String(currentPage));
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategoryFilter) params.append('category_id', selectedCategoryFilter);
    if (selectedAttributeFilter) params.append('attribute_id', selectedAttributeFilter);
    if (requiredFilter !== '') params.append('is_required', requiredFilter);
    return `?${params.toString()}`;
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      'getCategoryAttributesData',
      currentPage,
      itemsPerPage,
      searchTerm,
      selectedCategoryFilter,
      selectedAttributeFilter,
      requiredFilter,
    ],
    queryFn: () => getCategoryAttributesApi(buildQueryString()),
  });

  const categoryAttributesList: CategoryAttribute[] = data?.data?.data || [];
  const paginationData = data?.data?.pagination;
  const totalPages = paginationData?.total_pages || Math.ceil((categoryAttributesList.length || 0) / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryFilter, selectedAttributeFilter, requiredFilter]);

  const handleOpenAddModal = () => {
    setEditItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: CategoryAttribute) => {
    setEditItem(item);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (item: CategoryAttribute) => {
    setItemToDelete(item);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deleteCategoryAttributeApi(itemToDelete.id);
      toast.success('Category Attribute deleted successfully!');
      queryClient.invalidateQueries(['getCategoryAttributesData'] as unknown as InvalidateQueryFilters);
      setDeleteModal(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete Category Attribute.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Category Attributes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Map component categories to technical attributes and configure requirement rules
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <Layers className="w-4 h-4 text-[#e2ba2b]" />
            <span>{paginationData?.count ?? categoryAttributesList.length} Mappings</span>
          </div>
          <Button onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Mapping
          </Button>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search mapping by category or attribute..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none max-w-[150px] truncate"
            >
              <option value="">All Categories</option>
              {categoriesList?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.title || `Category #${cat.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Attribute Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <select
              value={selectedAttributeFilter}
              onChange={(e) => setSelectedAttributeFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none max-w-[150px] truncate"
            >
              <option value="">All Attributes</option>
              {attributesList?.map((attr: any) => (
                <option key={attr.id} value={attr.id}>
                  {attr.name}
                </option>
              ))}
            </select>
          </div>

          {/* Required Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <select
              value={requiredFilter}
              onChange={(e) => setRequiredFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none"
            >
              <option value="">All Requirements</option>
              <option value="true">Required Only</option>
              <option value="false">Optional Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Attribute</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Requirement</th>
                  {/* <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Display Order</th> */}
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <td key={idx} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : categoryAttributesList?.length ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Attribute</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Requirement</th>
                  {/* <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order</th> */}
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categoryAttributesList.map((item, index) => (
                  <tr key={item.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Category Column */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2.5">
                        {item.category?.icon ? (
                          <img
                            src={item.category.icon}
                            alt={item.category.name}
                            className="w-7 h-7 object-contain rounded-lg border bg-gray-50"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#e2ba2b] flex items-center justify-center font-bold text-xs">
                            <Layers className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-bold text-gray-900">{item.category?.name || 'Category'}</span>
                      </div>
                    </td>

                    {/* Attribute Column */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 capitalize">{item.attribute?.name || '---'}</span>
                        {/* {item.attribute?.unit && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                            {item.attribute.unit}
                          </span>
                        )}
                        {item.attribute?.data_type && (
                          <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-semibold border border-blue-100">
                            {item.attribute.data_type}
                          </span>
                        )} */}
                      </div>
                    </td>

                    {/* Is Required Column */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.is_required
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                      >
                        {item.is_required ? 'Required' : 'Optional'}
                      </span>
                    </td>

                    {/* Display Order */}
                    {/* <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700">
                      <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-700 rounded-full font-mono text-xs font-bold">
                        #{item.display_order ?? 1}
                      </span>
                    </td> */}

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 rounded-lg bg-amber-50 text-[#c49e1e] hover:bg-amber-100 transition-colors shadow-2xs"
                          title="Edit Mapping"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(item)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-2xs"
                          title="Delete Mapping"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 px-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 mt-6 shadow-2xs">
          <img className="size-44 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Mappings" />
          <div className="mt-4 text-gray-900 font-semibold text-lg">No Category Attribute Mappings Found</div>
          <p className="text-gray-500 text-sm mt-1">Click "Add Mapping" to connect attributes with PC Builder component categories.</p>
        </div>
      )}

      {/* Modal Component */}
      {isModalOpen && (
        <CategoryAttributeModal
          categoryAttribute={editItem}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries(['getCategoryAttributesData'] as unknown as InvalidateQueryFilters);
          }}
          vendorId={vendorId}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && itemToDelete && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Category Attribute</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete mapping between <span className="font-bold text-gray-900">"{itemToDelete.category?.name}"</span> and <span className="font-bold text-gray-900">"{itemToDelete.attribute?.name}"</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-xs flex items-center gap-2"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
