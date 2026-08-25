import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight,
  Package,
  Sliders,
  DollarSign,
  Tag,
  Boxes,
} from 'lucide-react';
import Button from '../Button';
import {
  getPcCategoriesApi,
  getPcComponentsApi,
  checkPcCompatibilityApi,
} from '../../Api-Service/Apis';
import EmptyBox from '../../assets/image/empty-box.png';

interface CompatibilityTesterModalProps {
  onClose: () => void;
  initialBaseCategoryId?: string;
  initialTargetCategoryId?: string;
}

export default function CompatibilityTesterModal({
  onClose,
  initialBaseCategoryId = '',
  initialTargetCategoryId = '',
}: CompatibilityTesterModalProps) {
  const [selectedBaseCategory, setSelectedBaseCategory] = useState(initialBaseCategoryId);
  const [selectedComponentId, setSelectedComponentId] = useState('');
  const [selectedTargetCategory, setSelectedTargetCategory] = useState(initialTargetCategoryId);

  const [tested, setTested] = useState(false);
  const [loadingTest, setLoadingTest] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testError, setTestError] = useState<string | null>(null);

  // Fetch PC Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['getPcCategoriesDataForSelect'],
    queryFn: () => getPcCategoriesApi('?per_page=100'),
  });

  const categoriesList: any[] = categoriesRes?.data?.data || categoriesRes?.data || [];

  // Fetch Components filtered by selectedBaseCategory
  const { data: componentsRes, isLoading: loadingComponents } = useQuery({
    queryKey: ['getPcComponentsForTester', selectedBaseCategory],
    queryFn: () =>
      getPcComponentsApi(
        `?per_page=100${selectedBaseCategory ? `&category_id=${selectedBaseCategory}` : ''}`
      ),
  });

  const componentsList: any[] = componentsRes?.data?.data || [];

  const handleTestCompatibility = async () => {
    if (!selectedComponentId) {
      setTestError('Please choose a specific component to test compatibility for.');
      return;
    }
    if (!selectedTargetCategory) {
      setTestError('Please choose a target category to check compatibility against.');
      return;
    }

    setTestError(null);
    setLoadingTest(true);
    setTested(true);

    try {
      const res = await checkPcCompatibilityApi(selectedComponentId, selectedTargetCategory);
      const data = res?.data?.data || (Array.isArray(res?.data) ? res.data : []);
      setTestResults(data);
    } catch (err: any) {
      setTestError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to evaluate compatibility. Please check rule definitions.'
      );
      setTestResults([]);
    } finally {
      setLoadingTest(false);
    }
  };

  const chosenComponent = componentsList.find((c: any) => c.id === selectedComponentId);
  const targetCategoryObj = categoriesList.find((c: any) => c.id === selectedTargetCategory);

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[90vh] border border-gray-100 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 shrink-0 bg-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#c49e1e] flex items-center justify-center border border-amber-200/60 font-bold shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                Live Compatibility Tester
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Verify rule evaluation by testing a component against any category
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Config Controls */}
          <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-200/80 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Filter Base Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#c49e1e]" />
                  <span>Base Category (Optional)</span>
                </label>
                <select
                  value={selectedBaseCategory}
                  onChange={(e) => {
                    setSelectedBaseCategory(e.target.value);
                    setSelectedComponentId('');
                    setTested(false);
                  }}
                  className="w-full px-3 py-2 bg-white text-xs font-medium text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Specific Component */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#c49e1e]" />
                  <span>Select Base Component <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={selectedComponentId}
                  onChange={(e) => {
                    setSelectedComponentId(e.target.value);
                    setTested(false);
                  }}
                  disabled={loadingComponents}
                  className="w-full px-3 py-2 bg-white text-xs font-medium text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] focus:outline-none"
                >
                  <option value="">Choose Component...</option>
                  {componentsList.map((comp: any) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.brand ? `${comp.brand} - ` : ''}
                      {comp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Target Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#c49e1e]" />
                  <span>Target Category to Test <span className="text-red-500">*</span></span>
                </label>
                <select
                  value={selectedTargetCategory}
                  onChange={(e) => {
                    setSelectedTargetCategory(e.target.value);
                    setTested(false);
                  }}
                  className="w-full px-3 py-2 bg-white text-xs font-medium text-gray-900 border border-gray-300 rounded-xl focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] focus:outline-none"
                >
                  <option value="">Choose Target Category...</option>
                  {categoriesList.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="button"
                disabled={!selectedComponentId || !selectedTargetCategory || loadingTest}
                onClick={handleTestCompatibility}
                className="w-full sm:w-auto"
              >
                {loadingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />
                    Checking Compatibility...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Evaluate Compatible Components
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Test Error */}
          {testError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{testError}</span>
            </div>
          )}

          {/* Selected Component Attributes Preview */}
          {chosenComponent && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {chosenComponent.image ? (
                  <img
                    src={chosenComponent.image}
                    alt={chosenComponent.name}
                    className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                    <Cpu className="w-6 h-6 text-[#c49e1e]" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-200/60 text-amber-900">
                      Base Component
                    </span>
                    {chosenComponent.brand && (
                      <span className="text-xs font-semibold text-gray-500">
                        {chosenComponent.brand}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mt-0.5">{chosenComponent.name}</h4>
                </div>
              </div>

              {chosenComponent.attribute_values && chosenComponent.attribute_values.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-md">
                  {chosenComponent.attribute_values.map((av: any) => (
                    <span
                      key={av.id}
                      className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[11px] font-medium text-gray-700 shadow-2xs"
                    >
                      <span className="text-gray-400">{av.attribute?.name || 'Attr'}:</span>{' '}
                      <strong className="text-gray-900">{av.value}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Section */}
          {tested && !loadingTest && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Compatible {targetCategoryObj?.name || 'Components'} Found ({testResults.length})
                  </span>
                </h4>
              </div>

              {testResults.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200/70 p-6">
                  <img src={EmptyBox} alt="No compatible components" className="w-16 h-16 mx-auto opacity-50 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No compatible items found</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                    No components in {targetCategoryObj?.name || 'this category'} satisfy the compatibility rule conditions with the selected component.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {testResults.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-gray-200 rounded-xl shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2.5">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-contain bg-gray-50 border border-gray-200 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] font-bold uppercase text-gray-400">
                                {item.brand || item.category?.name || 'Hardware'}
                              </span>
                              <h5 className="text-xs font-bold text-gray-900 line-clamp-1">
                                {item.name}
                              </h5>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Compatible
                          </span>
                        </div>

                        {/* Attribute Values Pill List */}
                        {item.attribute_values && item.attribute_values.length > 0 && (
                          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-gray-100 text-[11px]">
                            {item.attribute_values.map((av: any) => (
                              <div
                                key={av.id}
                                className="bg-gray-50 p-1.5 rounded-lg border border-gray-100 flex flex-col"
                              >
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">
                                  {av.attribute?.name || 'Spec'}
                                </span>
                                <span className="font-bold text-gray-800 truncate">
                                  {av.value} {av.attribute?.unit ? `${av.attribute.unit}` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 text-xs">
                        <span className="font-bold text-gray-900">
                          ₹{Number(item.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            Number(item.stock) > 0 ? 'text-emerald-600' : 'text-red-500'
                          }`}
                        >
                          {Number(item.stock) > 0 ? `${item.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 shrink-0 flex justify-end bg-gray-50/50">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
