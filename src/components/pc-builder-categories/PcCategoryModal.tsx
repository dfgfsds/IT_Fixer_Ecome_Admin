import React, { useState, useEffect } from 'react';
import { X, Loader2, FolderTree } from 'lucide-react';
import Button from '../Button';
import SingleImageUpload from '../products/SingleImageUpload';
import { postPcCategoryCreateApi, updatePcCategoryApi } from '../../Api-Service/Apis';
import { PcCategory, PcCategoryForm } from '../../types/pcCategory';
import { toast } from 'react-toastify';

interface PcCategoryModalProps {
  category: PcCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PcCategoryModal({
  category,
  onClose,
  onSuccess,
}: PcCategoryModalProps) {
  const getInitialImage = () => {
    if (!category?.icon) return [];
    return [{ url: category.icon }];
  };

  const [name, setName] = useState(category?.name || '');
  const [images, setImages] = useState<any[]>(getInitialImage());
  const [description, setDescription] = useState(category?.description || '');
  const [status, setStatus] = useState(category?.status || 'Active');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setImages(category.icon ? [{ url: category.icon }] : []);
      setDescription(category.description || '');
      setStatus(category.status || 'Active');
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category Name is required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const iconUrl = images[0]?.url || category?.icon || '';

    // Generate slug from name
    const generatedSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const payload: PcCategoryForm = {
      name: name.trim(),
      slug: generatedSlug,
      icon: iconUrl,
      description: description.trim(),
      status: status,
      created_by: category?.created_by || 'admin',
    };

    try {
      if (category?.id) {
        await updatePcCategoryApi(category.id, payload);
        toast.success('PC Category updated successfully!');
      } else {
        await postPcCategoryCreateApi(payload);
        toast.success('PC Category created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to save Category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Sticky Top Header */}
        <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#e2ba2b] flex items-center justify-center border border-amber-200/60 font-bold shrink-0">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {category ? 'Edit PC Category' : 'Create PC Category'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Configure category details for PC Builder components</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Category Name & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cabinet, Processor, GPU, RAM"
                required
                className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-medium"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Category Icon */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Category Icon Image
            </label>
            <SingleImageUpload images={images} onChange={setImages} label="Upload Category Icon" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. PC cases supporting ATX, Micro-ATX, and Mini-ITX motherboards."
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs text-sm"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Hidden Submit Button to support Enter key */}
          <button type="submit" className="hidden" />
        </form>

        {/* Sticky Bottom Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={loading} onClick={handleSubmit}>
            {category ? 'Update Category' : 'Create Category'}
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
