import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, FolderTree, X, Loader2, Filter } from 'lucide-react';
import Button from '../../components/Button';
import SearchInput from '../../components/Search';
import { Pagination } from '../Pagination';
import {
  getPcCategoriesApi,
  deletePcCategoryApi,
} from '../../Api-Service/Apis';
import { PcCategory } from '../../types/pcCategory';
import PcCategoryModal from '../../components/pc-builder-categories/PcCategoryModal';
import { toast } from 'react-toastify';
import EmptyBox from '../../assets/image/empty-box.png';

export default function BuilderCategories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<PcCategory | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<PcCategory | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Construct Query String
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('per_page', String(itemsPerPage));
    params.append('current_page', String(currentPage));
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (statusFilter) params.append('status', statusFilter);
    return `?${params.toString()}`;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['getPcCategoriesData', currentPage, itemsPerPage, searchTerm, statusFilter],
    queryFn: () => getPcCategoriesApi(buildQueryString()),
  });

  const categoriesList: PcCategory[] = data?.data?.data || [];
  const paginationData = data?.data?.pagination;
  const totalPages = paginationData?.total_pages || Math.ceil((categoriesList.length || 0) / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleOpenAddModal = () => {
    setEditCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: PcCategory) => {
    setEditCategory(cat);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (cat: PcCategory) => {
    setCategoryToDelete(cat);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deletePcCategoryApi(categoryToDelete.id);
      toast.success('PC Category deleted successfully!');
      queryClient.invalidateQueries(['getPcCategoriesData'] as unknown as InvalidateQueryFilters);
      setDeleteModal(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete PC Category.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PC Builder Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage hardware categories for the PC Builder (e.g. Cabinet, Processor, GPU, RAM, Motherboard)
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <FolderTree className="w-4 h-4 text-[#e2ba2b]" />
            <span>{paginationData?.count ?? categoriesList.length} Categories</span>
          </div>
          <Button onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by category name, slug or description..."
          className="w-full md:w-80"
        />

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
                  {/* <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Slug</th> */}
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
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
      ) : categoriesList?.length ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  {/* <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Slug</th> */}
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categoriesList.map((cat, index) => (
                  <tr key={cat.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Category Icon & Name */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        {cat.icon ? (
                          <img
                            src={cat.icon}
                            alt={cat.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = EmptyBox;
                            }}
                            className="w-9 h-9 object-contain rounded-xl border border-gray-200 shrink-0 bg-gray-50 p-1"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#e2ba2b] flex items-center justify-center font-bold text-xs shrink-0 border border-amber-200/60">
                            <FolderTree className="w-4 h-4" />
                          </div>
                        )}
                        <span className="font-bold text-gray-900">{cat.name}</span>
                      </div>
                    </td>

                    {/* Slug */}
                    {/* <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-500 text-xs">
                      {cat.slug}
                    </td> */}

                    {/* Description */}
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={cat.description}>
                      {cat.description || '--'}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cat.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                      >
                        {cat.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg bg-amber-50 text-[#c49e1e] hover:bg-amber-100 transition-colors shadow-2xs"
                          title="Edit Category"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(cat)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-2xs"
                          title="Delete Category"
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
          <img className="size-44 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Categories" />
          <div className="mt-4 text-gray-900 font-semibold text-lg">No PC Builder Categories Found</div>
          <p className="text-gray-500 text-sm mt-1">Click "Add Category" to create categories like Cabinet, Processor, GPU, RAM, etc.</p>
        </div>
      )}

      {/* Modal Component */}
      {isModalOpen && (
        <PcCategoryModal
          category={editCategory}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries(['getPcCategoriesData'] as unknown as InvalidateQueryFilters);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete PC Category</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{categoryToDelete.name}"</span>?
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
