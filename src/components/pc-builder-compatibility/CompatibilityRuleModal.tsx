import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Loader2, GitCompare, Plus, Trash2, ArrowRight, CheckCircle2, Sliders, Layers, AlertCircle } from 'lucide-react';
import Button from '../Button';
import {
  getPcCategoriesApi,
  getAttributesApi,
  postPcCompatibilityRuleCreateApi,
  updatePcCompatibilityRuleApi,
} from '../../Api-Service/Apis';
import {
  CompatibilityRule,
  CompatibilityRuleForm,
  CompatibilityOperator,
  ConditionPayload,
} from '../../types/pcCompatibility';
import { toast } from 'react-toastify';

interface CompatibilityRuleModalProps {
  rule: CompatibilityRule | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface ConditionItem {
  id?: string;
  base_attribute_id: string;
  target_attribute_id: string;
  operator: CompatibilityOperator;
}

export default function CompatibilityRuleModal({
  rule,
  onClose,
  onSuccess,
}: CompatibilityRuleModalProps) {
  const [baseCategoryId, setBaseCategoryId] = useState(
    rule?.base_category?.id || rule?.base_category_id || ''
  );
  const [targetCategoryId, setTargetCategoryId] = useState(
    rule?.target_category?.id || rule?.target_category_id || ''
  );

  const [conditions, setConditions] = useState<ConditionItem[]>([
    { base_attribute_id: '', target_attribute_id: '', operator: 'EXACT' },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch PC Categories
  const { data: categoriesRes, isLoading: loadingCategories } = useQuery({
    queryKey: ['getPcCategoriesDataForSelect'],
    queryFn: () => getPcCategoriesApi('?per_page=100'),
  });

  // Fetch Attributes
  const { data: attributesRes, isLoading: loadingAttributes } = useQuery({
    queryKey: ['getAttributesDataForSelect'],
    queryFn: () => getAttributesApi('?per_page=100'),
  });

  const categoriesList: any[] = categoriesRes?.data?.data || categoriesRes?.data || [];
  const attributesList: any[] = attributesRes?.data?.data || attributesRes?.data || [];

  // Populate data if editing
  useEffect(() => {
    if (rule) {
      setBaseCategoryId(rule.base_category?.id || rule.base_category_id || '');
      setTargetCategoryId(rule.target_category?.id || rule.target_category_id || '');
      if (rule.conditions && rule.conditions.length > 0) {
        setConditions(
          rule.conditions.map((c) => ({
            id: c.id,
            base_attribute_id: c.base_attribute?.id || c.base_attribute_id || '',
            target_attribute_id: c.target_attribute?.id || c.target_attribute_id || '',
            operator: c.operator || 'EXACT',
          }))
        );
      } else {
        setConditions([{ base_attribute_id: '', target_attribute_id: '', operator: 'EXACT' }]);
      }
    }
  }, [rule]);

  const handleAddCondition = () => {
    setConditions([
      ...conditions,
      { base_attribute_id: '', target_attribute_id: '', operator: 'EXACT' },
    ]);
  };

  const handleRemoveCondition = (index: number) => {
    if (conditions.length <= 1) {
      toast.info('At least one condition is required for a compatibility rule.');
      return;
    }
    setConditions(conditions.filter((_, idx) => idx !== index));
  };

  const handleConditionChange = (
    index: number,
    field: 'base_attribute_id' | 'target_attribute_id' | 'operator',
    value: string
  ) => {
    const updated = [...conditions];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setConditions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!baseCategoryId) {
      setErrorMsg('Please select a Base Category.');
      return;
    }
    if (!targetCategoryId) {
      setErrorMsg('Please select a Target Category.');
      return;
    }
    if (baseCategoryId === targetCategoryId) {
      setErrorMsg('Base Category and Target Category cannot be the same.');
      return;
    }

    // Validate conditions
    for (let i = 0; i < conditions.length; i++) {
      const cond = conditions[i];
      if (!cond.base_attribute_id) {
        setErrorMsg(`Please select Base Attribute for Condition #${i + 1}.`);
        return;
      }
      if (!cond.target_attribute_id) {
        setErrorMsg(`Please select Target Attribute for Condition #${i + 1}.`);
        return;
      }
      if (!cond.operator) {
        setErrorMsg(`Please select an Operator for Condition #${i + 1}.`);
        return;
      }
    }

    const payload: CompatibilityRuleForm = {
      base_category_id: baseCategoryId,
      target_category_id: targetCategoryId,
      conditions: conditions.map((c) => ({
        base_attribute_id: c.base_attribute_id,
        target_attribute_id: c.target_attribute_id,
        operator: c.operator,
      })),
    };

    setLoading(true);
    try {
      if (rule?.id) {
        await updatePcCompatibilityRuleApi(rule.id, payload);
        toast.success('Compatibility rule updated successfully!');
      } else {
        await postPcCompatibilityRuleCreateApi(payload);
        toast.success('Compatibility rule created successfully!');
      }
      onSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        JSON.stringify(err?.response?.data?.errors || '') ||
        'Failed to save compatibility rule. Please check your inputs.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const selectedBaseCat = categoriesList.find((c: any) => c.id === baseCategoryId);
  const selectedTargetCat = categoriesList.find((c: any) => c.id === targetCategoryId);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Sticky Header */}
        <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#c49e1e] flex items-center justify-center border border-amber-200/60 font-bold shrink-0">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {rule ? 'Edit Compatibility Rule' : 'Create Compatibility Rule'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Define compatibility constraints and operators between component categories
              </p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category Configuration Box */}
          <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-200/70 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-[#c49e1e]" />
              <span>1. Select Component Categories</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Base Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Base Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={baseCategoryId}
                  onChange={(e) => setBaseCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  required
                  className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="">Select Base Category...</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">E.g., Processor (CPU)</p>
              </div>

              {/* Target Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={targetCategoryId}
                  onChange={(e) => setTargetCategoryId(e.target.value)}
                  disabled={loadingCategories}
                  required
                  className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-2 focus:ring-[#e2ba2b]/20 focus:outline-none shadow-2xs font-medium"
                >
                  <option value="">Select Target Category...</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat.id} value={cat.id} disabled={cat.id === baseCategoryId}>
                      {cat.name} {cat.id === baseCategoryId ? '(Same as base)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-400 mt-1">E.g., Motherboard</p>
              </div>
            </div>

            {/* Visual flow indicator */}
            {selectedBaseCat && selectedTargetCat && (
              <div className="flex items-center justify-center gap-2 py-2 px-3 bg-white rounded-lg border border-amber-200/60 text-xs font-semibold text-gray-700">
                <span className="text-amber-700 font-bold">{selectedBaseCat.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-amber-700 font-bold">{selectedTargetCat.name}</span>
                <span className="text-gray-400 font-normal ml-1">compatibility relation</span>
              </div>
            )}
          </div>

          {/* Conditions Builder Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-[#c49e1e]" />
                <span>2. Rule Conditions & Operators</span>
              </div>
              <button
                type="button"
                onClick={handleAddCondition}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 text-[#c49e1e] rounded-lg text-xs font-bold transition-colors border border-amber-200/60"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Condition
              </button>
            </div>

            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className="p-3.5 bg-gray-50/70 border border-gray-200 rounded-xl relative hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Condition #{index + 1}
                    </span>
                    {conditions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg transition-colors text-xs flex items-center gap-1"
                        title="Remove condition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-2.5 items-center">
                    {/* Base Attribute */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Base Attribute ({selectedBaseCat?.name || 'Base'})
                      </label>
                      <select
                        value={condition.base_attribute_id}
                        onChange={(e) =>
                          handleConditionChange(index, 'base_attribute_id', e.target.value)
                        }
                        disabled={loadingAttributes}
                        required
                        className="w-full px-3 py-2 bg-white text-xs text-gray-900 border border-gray-300 rounded-lg focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] focus:outline-none font-medium"
                      >
                        <option value="">Select Attribute...</option>
                        {attributesList.map((attr: any) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.name} {attr.unit ? `(${attr.unit})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Operator */}
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-medium text-gray-500 mb-1 text-center sm:text-left">
                        Operator
                      </label>
                      <select
                        value={condition.operator}
                        onChange={(e) =>
                          handleConditionChange(
                            index,
                            'operator',
                            e.target.value as CompatibilityOperator
                          )
                        }
                        required
                        className="w-full px-2 py-2 bg-white text-xs font-bold text-center text-amber-900 border border-amber-300 rounded-lg focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] focus:outline-none bg-amber-50/50"
                      >
                        <option value="EXACT">== (EXACT)</option>
                        <option value="LTE">&lt;= (LTE)</option>
                        <option value="GTE">&gt;= (GTE)</option>
                      </select>
                    </div>

                    {/* Target Attribute */}
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Target Attribute ({selectedTargetCat?.name || 'Target'})
                      </label>
                      <select
                        value={condition.target_attribute_id}
                        onChange={(e) =>
                          handleConditionChange(index, 'target_attribute_id', e.target.value)
                        }
                        disabled={loadingAttributes}
                        required
                        className="w-full px-3 py-2 bg-white text-xs text-gray-900 border border-gray-300 rounded-lg focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] focus:outline-none font-medium"
                      >
                        <option value="">Select Attribute...</option>
                        {attributesList.map((attr: any) => (
                          <option key={attr.id} value={attr.id}>
                            {attr.name} {attr.unit ? `(${attr.unit})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Condition Preview Text */}
                  {condition.base_attribute_id && condition.target_attribute_id && (
                    <div className="mt-2 text-[11px] text-gray-600 bg-white p-2 rounded-md border border-gray-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Match condition:{' '}
                        <strong>
                          {attributesList.find((a: any) => a.id === condition.base_attribute_id)?.name || 'Base Attr'}
                        </strong>{' '}
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {condition.operator === 'EXACT' ? 'EQUALS (=)' : condition.operator === 'LTE' ? 'LESS THAN OR EQUAL (<=)' : 'GREATER THAN OR EQUAL (>=)'}
                        </span>{' '}
                        <strong>
                          {attributesList.find((a: any) => a.id === condition.target_attribute_id)?.name || 'Target Attr'}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button type="submit" className="hidden" />
        </form>

        {/* Sticky Bottom Actions */}
        <div className="p-4 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={loading} onClick={handleSubmit}>
            {rule ? 'Update Compatibility Rule' : 'Create Compatibility Rule'}
            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
