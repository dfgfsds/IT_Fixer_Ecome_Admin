import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  GitCompare,
  Layers,
  ArrowRight,
  Sparkles,
  Search,
  Filter,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Sliders,
} from 'lucide-react';
import Button from '../../components/Button';
import SearchInput from '../../components/Search';
import { Pagination } from '../Pagination';
import {
  getPcCompatibilityRulesApi,
  getPcCategoriesApi,
  deletePcCompatibilityRuleApi,
} from '../../Api-Service/Apis';
import { CompatibilityRule } from '../../types/pcCompatibility';
import CompatibilityRuleModal from '../../components/pc-builder-compatibility/CompatibilityRuleModal';
import CompatibilityTesterModal from '../../components/pc-builder-compatibility/CompatibilityTesterModal';
import { toast } from 'react-toastify';
import EmptyBox from '../../assets/image/empty-box.png';

export default function PcCompatibility() {
  const { id: vendorId } = useParams<{ id: string }>();

  // Modals state
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [isTesterModalOpen, setIsTesterModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<CompatibilityRule | null>(null);

  const [testerBaseCategory, setTesterBaseCategory] = useState('');
  const [testerTargetCategory, setTesterTargetCategory] = useState('');

  // Delete state
  const [deleteModal, setDeleteModal] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<CompatibilityRule | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [baseCategoryFilter, setBaseCategoryFilter] = useState('');
  const [targetCategoryFilter, setTargetCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Fetch PC Categories for filter dropdowns
  const { data: categoriesRes } = useQuery({
    queryKey: ['getPcCategoriesDataForSelect'],
    queryFn: () => getPcCategoriesApi('?per_page=1000'),
  });
  const categoriesList: any[] = categoriesRes?.data?.data || categoriesRes?.data || [];

  // Build query string
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('page_size', String(itemsPerPage));
    params.append('current_page', String(currentPage));
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (baseCategoryFilter) params.append('base_category_id', baseCategoryFilter);
    if (targetCategoryFilter) params.append('target_category_id', targetCategoryFilter);
    return `?${params.toString()}`;
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      'getPcCompatibilityRulesData',
      currentPage,
      itemsPerPage,
      searchTerm,
      baseCategoryFilter,
      targetCategoryFilter,
    ],
    queryFn: () => getPcCompatibilityRulesApi(buildQueryString()),
  });

  const rawRules: CompatibilityRule[] = useMemo(() => {
    if (Array.isArray(data?.data?.data)) return data.data.data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }, [data]);

  // Client-side fallback search filter if backend doesn't filter search term
  const filteredRules = useMemo(() => {
    return rawRules.filter((rule) => {
      const baseName = rule.base_category?.name || '';
      const targetName = rule.target_category?.name || '';
      const matchesSearch =
        !searchTerm.trim() ||
        baseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        targetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.conditions?.some(
          (c) =>
            c.base_attribute?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.target_attribute?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesBase = !baseCategoryFilter || rule.base_category?.id === baseCategoryFilter;
      const matchesTarget =
        !targetCategoryFilter || rule.target_category?.id === targetCategoryFilter;

      return matchesSearch && matchesBase && matchesTarget;
    });
  }, [rawRules, searchTerm, baseCategoryFilter, targetCategoryFilter]);

  const paginationData = data?.data?.pagination;
  const totalPages =
    paginationData?.total_pages ||
    Math.ceil((filteredRules.length || 0) / itemsPerPage) ||
    1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, baseCategoryFilter, targetCategoryFilter]);

  const handleOpenAddModal = () => {
    setEditRule(null);
    setIsRuleModalOpen(true);
  };

  const handleOpenEditModal = (rule: CompatibilityRule) => {
    setEditRule(rule);
    setIsRuleModalOpen(true);
  };

  const handleOpenTester = (baseCatId = '', targetCatId = '') => {
    setTesterBaseCategory(baseCatId);
    setTesterTargetCategory(targetCatId);
    setIsTesterModalOpen(true);
  };

  const handleOpenDeleteModal = (rule: CompatibilityRule) => {
    setRuleToDelete(rule);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!ruleToDelete?.id) return;
    setDeleteLoading(true);
    try {
      await deletePcCompatibilityRuleApi(ruleToDelete.id);
      toast.success('Compatibility rule deleted successfully!');
      queryClient.invalidateQueries([
        'getPcCompatibilityRulesData',
      ] as unknown as InvalidateQueryFilters);
      setDeleteModal(false);
      setRuleToDelete(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete compatibility rule.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Stats calculation
  const totalRulesCount = paginationData?.count ?? filteredRules.length;
  const uniqueBaseCategories = new Set(filteredRules.map((r) => r.base_category?.id)).size;
  const totalConditions = filteredRules.reduce((acc, r) => acc + (r.conditions?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <GitCompare className="w-7 h-7 text-[#c49e1e]" />
            PC Compatibility Rules
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Define hardware compatibility logic, socket & spec constraints across component categories
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenTester()}
            className="flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#c49e1e]" />
            <span>Test Compatibility</span>
          </Button>
          <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Compatibility Rule</span>
          </Button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Rules
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalRulesCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#c49e1e] flex items-center justify-center border border-amber-200/60 font-bold">
            <GitCompare className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Base Categories Covered
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{uniqueBaseCategories}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 font-bold">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Condition Checks
            </p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalConditions}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60 font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by category name or attribute..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Base Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={baseCategoryFilter}
              onChange={(e) => setBaseCategoryFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none max-w-[150px] truncate"
            >
              <option value="">All Base Categories</option>
              {categoriesList?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Category Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={targetCategoryFilter}
              onChange={(e) => setTargetCategoryFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none max-w-[150px] truncate"
            >
              <option value="">All Target Categories</option>
              {categoriesList?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || baseCategoryFilter || targetCategoryFilter) && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setBaseCategoryFilter('');
                setTargetCategoryFilter('');
              }}
              className="p-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#c49e1e] mb-3" />
            <p className="text-sm font-medium text-gray-500">Loading compatibility rules...</p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="text-center py-16 px-4">
            <img src={EmptyBox} alt="No rules found" className="w-24 h-24 mx-auto mb-4 opacity-75" />
            <h3 className="text-base font-bold text-gray-900">No Compatibility Rules Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 mb-5">
              {searchTerm || baseCategoryFilter || targetCategoryFilter
                ? 'No rules match your search and filter criteria. Try clearing filters.'
                : 'Create your first compatibility rule to ensure customers only configure compatible components.'}
            </p>
            <Button onClick={handleOpenAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Compatibility Rule
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Sr. No.</th>
                  <th className="py-3.5 px-5">Base Category</th>
                  <th className="py-3.5 px-3 text-center">Relation</th>
                  <th className="py-3.5 px-5">Target Category</th>
                  <th className="py-3.5 px-5">Matching Conditions</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-medium">
                {filteredRules.map((rule, index: number) => {
                  const baseCatName = rule.base_category?.name || 'Base Category';
                  const targetCatName = rule.target_category?.name || 'Target Category';
                  const conditionsList = rule.conditions || [];

                  return (
                    <tr key={rule.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Sr. No. */}
                      <td className="py-4 px-5 align-middle">
                        <span className="font-medium text-gray-900">{index + 1}</span>
                      </td>

                      {/* Base Category */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#c49e1e] flex items-center justify-center border border-amber-200/60 shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{baseCatName}</span>
                            <span className="text-[11px] text-gray-400">Base Component</span>
                          </div>
                        </div>
                      </td>

                      {/* Direction Arrow */}
                      <td className="py-4 px-3 text-center align-middle">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500">
                          <ArrowRight className="w-4 h-4 text-[#c49e1e]" />
                        </div>
                      </td>

                      {/* Target Category */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60 shrink-0">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{targetCatName}</span>
                            <span className="text-[11px] text-gray-400">Target Component</span>
                          </div>
                        </div>
                      </td>

                      {/* Conditions */}
                      <td className="py-4 px-5 align-middle">
                        <div className="flex flex-col gap-1.5 max-w-md">
                          {conditionsList.map((cond, idx) => {
                            const baseAttrName =
                              cond.base_attribute?.name ||
                              cond.base_attribute_id ||
                              'Base Attribute';
                            const targetAttrName =
                              cond.target_attribute?.name ||
                              cond.target_attribute_id ||
                              'Target Attribute';
                            const op = cond.operator || 'EXACT';

                            const opLabel =
                              op === 'EXACT' ? '==' : op === 'LTE' ? '<=' : '>=';
                            const opBadgeClass =
                              op === 'EXACT'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : op === 'LTE'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-indigo-100 text-indigo-800 border-indigo-200';

                            return (
                              <div
                                key={cond.id || idx}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200/80 rounded-lg text-xs font-semibold text-gray-700 w-fit"
                              >
                                <span className="text-gray-900">{baseAttrName}</span>
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${opBadgeClass}`}
                                >
                                  {opLabel} {op}
                                </span>
                                <span className="text-gray-900">{targetAttrName}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right align-middle">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Test Tool Action */}
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenTester(rule.base_category?.id, rule.target_category?.id)
                            }
                            className="p-2 rounded-lg text-gray-500 hover:text-[#c49e1e] hover:bg-amber-50 transition-colors"
                            title="Test Compatibility with components"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* Edit Rule */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(rule)}
                            className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Rule"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete Rule */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(rule)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Pagination */}
        {filteredRules.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span>Rows per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalRulesCount)} to{' '}
                {Math.min(currentPage * itemsPerPage, totalRulesCount)} of {totalRulesCount} rules
              </span>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal && ruleToDelete && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3.5 mb-4 text-red-600">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Compatibility Rule?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  This action cannot be undone. PC Builder won't enforce this check anymore.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 text-xs mb-5 space-y-1">
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold">Base Category:</span>
                <span className="font-bold text-gray-900">{ruleToDelete.base_category?.name}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold">Target Category:</span>
                <span className="font-bold text-gray-900">{ruleToDelete.target_category?.name}</span>
              </div>
              <div className="flex items-center justify-between text-gray-700">
                <span className="font-semibold">Conditions Count:</span>
                <span className="font-bold text-gray-900">{ruleToDelete.conditions?.length || 0}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteModal(false);
                  setRuleToDelete(null);
                }}
              >
                Cancel
              </Button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50 flex items-center"
              >
                {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
                Delete Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      {isRuleModalOpen && (
        <CompatibilityRuleModal
          rule={editRule}
          onClose={() => setIsRuleModalOpen(false)}
          onSuccess={() => {
            setIsRuleModalOpen(false);
            queryClient.invalidateQueries([
              'getPcCompatibilityRulesData',
            ] as unknown as InvalidateQueryFilters);
          }}
        />
      )}

      {/* Live Compatibility Tester Modal */}
      {isTesterModalOpen && (
        <CompatibilityTesterModal
          initialBaseCategoryId={testerBaseCategory}
          initialTargetCategoryId={testerTargetCategory}
          onClose={() => setIsTesterModalOpen(false)}
        />
      )}
    </div>
  );
}
