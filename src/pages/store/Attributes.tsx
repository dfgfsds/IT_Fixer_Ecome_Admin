import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Sliders, X, Loader2, Filter } from 'lucide-react';
import Button from '../../components/Button';
import SearchInput from '../../components/Search';
import { Pagination } from '../Pagination';
import { getAttributesApi, postAttributeCreateApi, updateAttributeApi, deleteAttributeApi } from '../../Api-Service/Apis';
import { Attribute, AttributeForm } from '../../types/attribute';
import { toast } from 'react-toastify';
import EmptyBox from '../../assets/image/empty-box.png';

const DATA_TYPES = ['Integer', 'String', 'Float', 'Boolean', 'Select', 'MultiSelect'];

export default function Attributes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAttribute, setEditAttribute] = useState<Attribute | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dataTypeFilter, setDataTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Construct query string for API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('per_page', String(itemsPerPage));
    params.append('current_page', String(currentPage));
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (statusFilter) params.append('status', statusFilter);
    if (dataTypeFilter) params.append('data_type', dataTypeFilter);
    return `?${params.toString()}`;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['getAttributesData', currentPage, itemsPerPage, searchTerm, statusFilter, dataTypeFilter],
    queryFn: () => getAttributesApi(buildQueryString()),
  });

  const attributesList: Attribute[] = data?.data?.data || [];
  const paginationData = data?.data?.pagination;
  const totalPages = paginationData?.total_pages || Math.ceil((attributesList.length || 0) / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dataTypeFilter]);

  const handleOpenAddModal = () => {
    setEditAttribute(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (attr: Attribute) => {
    setEditAttribute(attr);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (attr: Attribute) => {
    setAttributeToDelete(attr);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!attributeToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deleteAttributeApi(attributeToDelete.id);
      toast.success('Attribute deleted successfully!');
      queryClient.invalidateQueries(['getAttributesData'] as unknown as InvalidateQueryFilters);
      setDeleteModal(false);
      setAttributeToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete attribute.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PC Builder Attributes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure technical specifications and properties for PC Builder component matching
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <Sliders className="w-4 h-4 text-[#e2ba2b]" />
            <span>{paginationData?.count ?? attributesList.length} Attributes</span>
          </div>
          <Button onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Attribute
          </Button>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by attribute name or slug..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Data Type Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={dataTypeFilter}
              onChange={(e) => setDataTypeFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none"
            >
              <option value="">All Data Types</option>
              {DATA_TYPES?.map((dt) => (
                <option key={dt} value={dt}>
                  {dt}
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

      {/* Attributes Table */}
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                  {/* <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Slug</th> */}
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Data Type</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Unit</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[...Array(5)]?.map((_, index) => (
                  <tr key={index}>
                    {Array?.from({ length: 7 })?.map((_, idx) => (
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
      ) : attributesList?.length ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  {/* <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Slug</th> */}
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Data Type</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Unit</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {attributesList?.map((attr, index) => (
                  <tr key={attr?.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                      {attr?.name}
                    </td>
                    {/* <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-500 text-xs">
                      {attr.slug}
                    </td> */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {attr?.data_type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700">
                      {attr?.unit || '--'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${attr.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}
                      >
                        {attr?.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(attr)}
                          className="p-1.5 rounded-lg bg-amber-50 text-[#c49e1e] hover:bg-amber-100 transition-colors shadow-2xs"
                          title="Edit Attribute"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDeleteModal(attr)}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-2xs"
                          title="Delete Attribute"
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
          <img className="size-44 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Attributes" />
          <div className="mt-4 text-gray-900 font-semibold text-lg">No Attributes Found</div>
          <p className="text-gray-500 text-sm mt-1">Click "Add Attribute" to define new component technical specs.</p>
        </div>
      )}

      {/* Attribute Add / Edit Modal */}
      {isModalOpen && (
        <AttributeModal
          attribute={editAttribute}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            queryClient.invalidateQueries(['getAttributesData'] as unknown as InvalidateQueryFilters);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && attributeToDelete && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Attribute</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{attributeToDelete.name}"</span>?
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

interface AttributeModalProps {
  attribute: Attribute | null;
  onClose: () => void;
  onSuccess: () => void;
}

function AttributeModal({ attribute, onClose, onSuccess }: AttributeModalProps) {
  const [name, setName] = useState(attribute?.name || '');
  const [slug, setSlug] = useState(attribute?.slug || '');
  const [dataType, setDataType] = useState(attribute?.data_type || 'Integer');
  const [unit, setUnit] = useState(attribute?.unit || '');
  const [status, setStatus] = useState(attribute?.status || 'Active');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate slug from name if creating new attribute
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!attribute) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name is required');
      return;
    }
    if (!slug.trim()) {
      setErrorMsg('Slug is required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const payload: AttributeForm = {
      name: name.trim(),
      slug: slug.trim(),
      data_type: dataType,
      unit: unit.trim(),
      status: status,
      created_by: "admin"
    };

    try {
      if (attribute?.id) {
        await updateAttributeApi(attribute.id, payload);
        toast.success('Attribute updated successfully!');
      } else {
        await postAttributeCreateApi(payload);
        toast.success('Attribute created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.response?.data?.errors || 'Failed to save attribute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {attribute ? 'Edit Attribute' : 'Create Attribute'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Attribute Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. SSD Write Speed"
              required
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs"
            />
          </div>

          {/* <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. ssd-write-speed"
              required
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-mono text-xs"
            />
          </div> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Data Type <span className="text-red-500">*</span>
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs"
              >
                {DATA_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {dt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Unit (Optional)
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. MB/s, W, GB"
                className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {attribute ? 'Update Attribute' : 'Create Attribute'}
              {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
