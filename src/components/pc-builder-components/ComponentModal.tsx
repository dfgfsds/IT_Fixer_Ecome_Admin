import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, Cpu, Plus, Trash2, Sliders, Layers } from 'lucide-react';
import Button from '../Button';
import SingleImageUpload from '../products/SingleImageUpload';
import {
  getPcCategoriesApi,
  getCategoryAttributesApi,
  getAttributesApi,
  postPcComponentCreateApi,
  updatePcComponentApi,
} from '../../Api-Service/Apis';
import { PcComponent, PcComponentForm, AttributeValuePayload } from '../../types/pcComponent';
import { toast } from 'react-toastify';

interface ComponentModalProps {
  component: PcComponent | null;
  onClose: () => void;
  onSuccess: () => void;
  vendorId?: string;
}

export default function ComponentModal({
  component,
  onClose,
  onSuccess,
}: ComponentModalProps) {
  const getInitialCategoryId = () => {
    if (!component) return '';
    if (typeof component.category === 'object' && component.category?.id) {
      return component.category.id;
    }
    if (typeof component.category === 'string') {
      return component.category;
    }
    return component.category_id || '';
  };

  const getInitialImage = () => {
    if (!component?.image) return [];
    return [{ url: component.image }];
  };

  const getInitialAttributeValues = (): AttributeValuePayload[] => {
    if (!component?.attribute_values || !Array.isArray(component.attribute_values)) return [];
    return component.attribute_values.map((item) => {
      const attrId = typeof item.attribute === 'object' ? item.attribute.id : item.attribute;
      return {
        attribute: attrId || '',
        value: item.value || '',
      };
    });
  };

  const [categoryId, setCategoryId] = useState<string>(getInitialCategoryId());
  const [brand, setBrand] = useState<string>(component?.brand || '');
  const [name, setName] = useState<string>(component?.name || '');
  const [images, setImages] = useState<any[]>(getInitialImage());
  const [description, setDescription] = useState<string>(component?.description || '');
  const [price, setPrice] = useState<number | string>(component?.price || '');
  const [stock, setStock] = useState<number | string>(component?.stock ?? 10);
  const [status, setStatus] = useState<string>(component?.status || 'Active');

  // Dynamic Attribute Values List
  const [attributeValues, setAttributeValues] = useState<AttributeValuePayload[]>(
    getInitialAttributeValues()
  );

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch PC Categories for Select
  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['getPcCategoriesDataForSelect'],
    queryFn: () => getPcCategoriesApi('?per_page=100'),
  });

  // Fetch Category Attributes for Selected Category
  const { data: categoryAttributesRes, isLoading: loadingCategoryAttributes } = useQuery({
    queryKey: ['getCategoryAttributesForSelect', categoryId],
    queryFn: () => getCategoryAttributesApi(categoryId ? `?category_id=${categoryId}` : ''),
    enabled: Boolean(categoryId),
  });

  // Fetch All Attributes as fallback
  const { data: attributesRes } = useQuery({
    queryKey: ['getAttributesDataForSelect'],
    queryFn: () => getAttributesApi('?per_page=100'),
  });

  const categoriesList: any[] = categoriesRes?.data?.data || categoriesRes?.data || [];
  const categoryAttributesList: any[] = categoryAttributesRes?.data?.data || categoryAttributesRes?.data || [];
  const allAttributesList: any[] = attributesRes?.data?.data || attributesRes?.data || [];

  // Derived available attributes for selected category
  const availableAttributes = categoryId && categoryAttributesList.length > 0
    ? categoryAttributesList.map((item: any) => ({
      id: typeof item.attribute === 'object' ? item.attribute.id : item.attribute,
      name: typeof item.attribute === 'object' ? item.attribute.name : `Attribute #${item.attribute}`,
      unit: typeof item.attribute === 'object' ? item.attribute.unit : '',
      is_required: item.is_required,
    }))
    : allAttributesList.map((attr: any) => ({
      id: attr.id,
      name: attr.name,
      unit: attr.unit || '',
      is_required: false,
    }));

  // Auto populate attribute rows when selecting a category for new component
  useEffect(() => {
    if (categoryId && categoryAttributesList.length > 0 && !component) {
      const autoRows = categoryAttributesList.map((item: any) => {
        const attrId = typeof item.attribute === 'object' ? item.attribute.id : item.attribute;
        return { attribute: attrId, value: '' };
      });
      setAttributeValues(autoRows);
    }
  }, [categoryId, categoryAttributesList, component]);

  // Add Attribute Value Row
  const handleAddAttributeRow = () => {
    const defaultAttrId = availableAttributes?.[0]?.id || '';
    setAttributeValues((prev) => [...prev, { attribute: defaultAttrId, value: '' }]);
  };

  // Remove Attribute Value Row
  const handleRemoveAttributeRow = (index: number) => {
    setAttributeValues((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Attribute Value Row
  const handleAttributeRowChange = (index: number, field: 'attribute' | 'value', val: string) => {
    setAttributeValues((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg('Please select a Category');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Component Name is required');
      return;
    }
    if (!brand.trim()) {
      setErrorMsg('Brand is required');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const imageUrl = images[0]?.url || component?.image || '';

    // Auto generate slug from name
    const generatedSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Filter out invalid empty rows
    const validAttrValues = attributeValues.filter((item) => item.attribute && item.value.trim() !== '');

    const payload: PcComponentForm = {
      category_id: categoryId,
      brand: brand.trim(),
      name: name.trim(),
      slug: generatedSlug,
      image: imageUrl,
      description: description.trim(),
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      status: status,
      created_by: component?.created_by || 'admin',
      attribute_values: validAttrValues,
    };

    try {
      if (component?.id) {
        await updatePcComponentApi(component.id, payload);
        toast.success('PC Component updated successfully!');
      } else {
        await postPcComponentCreateApi(payload);
        toast.success('PC Component created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        'Failed to save Component. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Sticky Top Header */}
        <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#e2ba2b] flex items-center justify-center border border-amber-200/60 font-bold shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {component ? 'Edit PC Component' : 'Create PC Component'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Manage component details and technical compatibility specs</p>
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
          {/* Category & Brand Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. NZXT, ASUS, Intel, AMD"
                required
                className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-medium"
              />
            </div>
          </div>

          {/* Component Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Component Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NZXT H7 Flow, Intel Core i9 14900K"
              required
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-medium"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Component Image
            </label>
            <SingleImageUpload images={images} onChange={setImages} />
          </div>

          {/* Price, Stock, Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9499.00"
                required
                className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Stock Quantity
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="10"
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

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. ATX Mid Tower Cabinet supporting ATX, Micro-ATX..."
              className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs"
            />
          </div>

          {/* Technical Attribute Values Section */}
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-[#e2ba2b]" />
                  <span>Technical Specifications ({attributeValues.length})</span>
                </label>
                {categoryId && (
                  <span className="text-[11px] text-gray-500">
                    Category attribute specifications
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddAttributeRow}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#c49e1e] hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Value
              </button>
            </div>

            {!categoryId ? (
              <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-xl text-center text-xs text-amber-800 font-medium">
                Please select a Category above to view and assign technical attribute specifications.
              </div>
            ) : loadingCategoryAttributes ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#e2ba2b]" />
                Loading Category Attributes...
              </div>
            ) : attributeValues.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center text-xs text-gray-400">
                No technical specifications assigned yet. Click "+ Add Value" to add specs (e.g. GPU Length, Form Factor).
              </div>
            ) : (
              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {attributeValues.map((row, idx) => {
                  const selectedAttrObj = availableAttributes.find((a) => a.id === row.attribute);
                  return (
                    <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-xl border border-gray-200/80">
                      <div className="flex-1">
                        <select
                          value={row.attribute}
                          onChange={(e) => handleAttributeRowChange(idx, 'attribute', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white text-xs font-medium text-gray-900 border border-gray-300 rounded-lg focus:border-[#e2ba2b] focus:outline-none"
                        >
                          <option value="">Select Attribute...</option>
                          {availableAttributes.map((attr: any) => (
                            <option key={attr.id} value={attr.id}>
                              {attr.name} {attr.unit ? `(${attr.unit})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={row.value}
                          onChange={(e) => handleAttributeRowChange(idx, 'value', e.target.value)}
                          placeholder={selectedAttrObj?.unit ? `e.g. 400 (${selectedAttrObj.unit})` : 'e.g. ATX, 400'}
                          className="w-full px-2.5 py-1.5 bg-white text-xs font-medium text-gray-900 border border-gray-300 rounded-lg focus:border-[#e2ba2b] focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAttributeRow(idx)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-colors shrink-0"
                        title="Remove Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
            {component ? 'Update Component' : 'Create Component'}
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
