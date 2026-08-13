import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, Layers, Sliders } from 'lucide-react';
import Button from '../Button';
import { getPcCategoriesApi, getAttributesApi, postCategoryAttributeCreateApi, updateCategoryAttributeApi } from '../../Api-Service/Apis';
import { CategoryAttribute, CategoryAttributeForm } from '../../types/categoryAttribute';
import { toast } from 'react-toastify';

interface CategoryAttributeModalProps {
  categoryAttribute: CategoryAttribute | null;
  onClose: () => void;
  onSuccess: () => void;
  vendorId?: string;
}

export default function CategoryAttributeModal({
  categoryAttribute,
  onClose,
  onSuccess,
}: CategoryAttributeModalProps) {
  const [categoryId, setCategoryId] = useState(categoryAttribute?.category?.id || '');
  const [attributeId, setAttributeId] = useState(categoryAttribute?.attribute?.id || '');
  const [isRequired, setIsRequired] = useState(categoryAttribute?.is_required ?? true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch PC Categories for Dropdown
  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['getPcCategoriesDataForSelect'],
    queryFn: () => getPcCategoriesApi('?per_page=100'),
  });

  // Fetch Attributes for Dropdown
  const { data: attributesRes, isLoading: loadingAttributes } = useQuery({
    queryKey: ['getAttributesDataForSelect'],
    queryFn: () => getAttributesApi('?per_page=100'),
  });

  const categoriesList: any[] = categoriesRes?.data?.data || categoriesRes?.data || [];
  const attributesList: any[] = attributesRes?.data?.data || attributesRes?.data || [];

  useEffect(() => {
    if (categoryAttribute) {
      setCategoryId(categoryAttribute.category?.id || '');
      setAttributeId(categoryAttribute.attribute?.id || '');
      setIsRequired(categoryAttribute.is_required ?? true);
    }
  }, [categoryAttribute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg('Please select a Category');
      return;
    }
    if (!attributeId) {
      setErrorMsg('Please select an Attribute');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const payload: CategoryAttributeForm = {
      category_id: categoryId,
      attribute_id: attributeId,
      is_required: Boolean(isRequired),
      display_order: categoryAttribute?.display_order ?? 1,
      created_by: categoryAttribute?.created_by || 'admin',
    };

    try {
      if (categoryAttribute?.id) {
        await updateCategoryAttributeApi(categoryAttribute.id, payload);
        toast.success('Category Attribute updated successfully!');
      } else {
        await postCategoryAttributeCreateApi(payload);
        toast.success('Category Attribute created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        'Failed to save Category Attribute. Please try again.'
      );
      setErrorMsg(
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        'Failed to save Category Attribute. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Sticky Top Header */}
        <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#e2ba2b] flex items-center justify-center border border-amber-200/60 font-bold shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {categoryAttribute ? 'Edit Category Attribute' : 'Add Category Attribute'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Map technical attributes to PC Builder categories</p>
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
          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>Category <span className="text-red-500">*</span></span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loadingCategories}
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs disabled:bg-gray-100 font-medium"
            >
              <option value="">Select Category...</option>
              {categoriesList?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Attribute Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-gray-400" />
              <span>Attribute <span className="text-red-500">*</span></span>
            </label>
            <select
              value={attributeId}
              onChange={(e) => setAttributeId(e.target.value)}
              required
              disabled={loadingAttributes}
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs disabled:bg-gray-100 font-medium"
            >
              <option value="">Select Attribute...</option>
              {attributesList?.map((attr: any) => (
                <option key={attr.id} value={attr.id}>
                  {attr.name}
                </option>
              ))}
            </select>
          </div>

          {/* Is Required Toggle */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between mt-2">
            <div>
              <span className="block text-sm font-bold text-gray-900">Is Required Attribute?</span>
              <span className="block text-xs text-gray-500">Require users to select this attribute when configuring PC</span>
            </div>
            <div
              onClick={() => setIsRequired(!isRequired)}
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 shrink-0 ${isRequired ? 'bg-emerald-500' : 'bg-gray-300'
                }`}
            >
              <span
                className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform duration-200 shadow-xs ${isRequired ? 'translate-x-6' : ''
                  }`}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <button type="submit" className="hidden" />
        </form>

        {/* Sticky Bottom Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={loading} onClick={handleSubmit}>
            {categoryAttribute ? 'Update Mapping' : 'Create Mapping'}
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
