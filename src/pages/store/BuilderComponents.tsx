import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, Eye, Cpu, Layers, X, Loader2, Filter, DollarSign } from 'lucide-react';
import Button from '../../components/Button';
import SearchInput from '../../components/Search';
import { Pagination } from '../Pagination';
import {
  getPcComponentsApi,
  getPcCategoriesApi,
  deletePcComponentApi,
} from '../../Api-Service/Apis';
import { PcComponent } from '../../types/pcComponent';
import ComponentModal from '../../components/pc-builder-components/ComponentModal';
import ComponentDetailsModal from '../../components/pc-builder-components/ComponentDetailsModal';
import { toast } from 'react-toastify';
import EmptyBox from '../../assets/image/empty-box.png';

export default function BuilderComponents() {
  const { id: vendorId } = useParams<{ id: string }>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editComponent, setEditComponent] = useState<PcComponent | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<PcComponent | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState<PcComponent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Fetch Categories for Filter Dropdown
  const { data: categoriesRes } = useQuery({
    queryKey: ['getPcCategoriesDataForSelect'],
    queryFn: () => getPcCategoriesApi('?per_page=100'),
  });
  const categoriesList: any[] = categoriesRes?.data?.data || categoriesRes?.data || [];

  // Construct Query String for PC Components API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('per_page', String(itemsPerPage));
    params.append('current_page', String(currentPage));
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (categoryFilter) params.append('category_id', categoryFilter);
    if (statusFilter) params.append('status', statusFilter);
    return `?${params.toString()}`;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['getPcComponentsData', currentPage, itemsPerPage, searchTerm, categoryFilter, statusFilter],
    queryFn: () => getPcComponentsApi(buildQueryString()),
  });

  const componentsList: PcComponent[] = data?.data?.data || [];
  const paginationData = data?.data?.pagination;
  const totalPages = paginationData?.total_pages || Math.ceil((componentsList.length || 0) / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleOpenAddModal = () => {
    setEditComponent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: PcComponent) => {
    setEditComponent(comp);
    setIsModalOpen(true);
    setSelectedComponent(null);
  };

  const handleViewComponent = (comp: PcComponent) => {
    setSelectedComponent(comp);
  };

  const handleOpenDeleteModal = (comp: PcComponent) => {
    setComponentToDelete(comp);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!componentToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deletePcComponentApi(componentToDelete.id);
      toast.success('PC Component deleted successfully!');
      queryClient.invalidateQueries(['getPcComponentsData'] as unknown as InvalidateQueryFilters);
      setDeleteModal(false);
      setComponentToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete PC Component.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getCategoryName = (comp: PcComponent) => {
    if (typeof comp.category === 'object' && comp.category?.name) {
      return comp.category.name;
    }
    return '--';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PC Builder Components</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage hardware components, stock quantities, pricing, and technical compatibility specifications
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <Cpu className="w-4 h-4 text-[#e2ba2b]" />
            <span>{paginationData?.count ?? componentsList.length} Components</span>
          </div>
          <Button onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Component
          </Button>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by component name, brand or slug..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none max-w-[160px] truncate"
            >
              <option value="">All Categories</option>
              {categoriesList?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name || cat.title || `Category #${cat.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
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

      {/* Components Table */}
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Component</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Category</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Price</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Stock</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Specs</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 8 }).map((_, idx) => (
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
      ) : componentsList?.length ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Component</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Specs</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {componentsList.map((comp, index) => (
                  <tr key={comp.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Component Info */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={comp.image || EmptyBox}
                          alt={comp.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = EmptyBox;
                          }}
                          className="w-10 h-10 object-cover rounded-xl border border-gray-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-gray-900 block">{comp.name}</span>
                          <span className="text-xs text-[#c49e1e] font-semibold bg-amber-50 px-2 py-0.5 rounded uppercase">
                            {comp.brand || 'No Brand'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700">
                      {getCategoryName(comp)}
                    </td>

                    {/* Price */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                      ₹{Number(comp.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Stock */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        {comp.stock ?? 0} in stock
                      </span>
                    </td>

                    {/* Technical Specs Count */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <Cpu className="w-3 h-3" />
                        {comp.attribute_values?.length || 0} Specs
                      </span>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${comp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                      >
                        {comp.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewComponent(comp)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(comp)}
                          className="p-1.5 rounded-lg bg-amber-50 text-[#c49e1e] hover:bg-amber-100 transition-colors shadow-2xs"
                          title="Edit Component"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(comp)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-2xs"
                          title="Delete Component"
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
          <img className="size-44 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Components" />
          <div className="mt-4 text-gray-900 font-semibold text-lg">No PC Components Found</div>
          <p className="text-gray-500 text-sm mt-1">Click "Add Component" to create your first hardware component.</p>
        </div>
      )}

      {/* Component Create / Edit Modal */}
      {isModalOpen && (
        <ComponentModal
          component={editComponent}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries(['getPcComponentsData'] as unknown as InvalidateQueryFilters);
          }}
          vendorId={vendorId}
        />
      )}

      {/* Component Details Modal */}
      {selectedComponent && (
        <ComponentDetailsModal
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
          onEdit={() => handleOpenEditModal(selectedComponent)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && componentToDelete && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete PC Component</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{componentToDelete.name}"</span>?
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
