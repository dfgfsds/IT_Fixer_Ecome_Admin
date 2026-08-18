import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { Eye, Loader2, Monitor, Box, Filter } from 'lucide-react';
import Button from '../../components/Button';
import SearchInput from '../../components/Search';
import { Pagination } from '../Pagination';
import { getPcBuildsApi } from '../../Api-Service/Apis';
import { PcBuild } from '../../types/pcBuild';
import BuildDetailsModal from '../../components/pc-builder-builds/BuildDetailsModal';
import { toast } from 'react-toastify';
import EmptyBox from '../../assets/image/empty-box.png';

export default function PcBuilds() {
  const { id: vendorId } = useParams<{ id: string }>();

  const [selectedBuild, setSelectedBuild] = useState<PcBuild | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLockedFilter, setIsLockedFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryClient = useQueryClient();

  // Construct Query String for PC Builds API
  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append('page_size', String(itemsPerPage));
    params.append('page', String(currentPage));
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (statusFilter) params.append('status', statusFilter);
    if (isLockedFilter) params.append('is_locked', isLockedFilter);
    return `?${params.toString()}`;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['getPcBuildsData', currentPage, itemsPerPage, searchTerm, statusFilter, isLockedFilter],
    queryFn: () => getPcBuildsApi(buildQueryString()),
  });

  const buildsList: PcBuild[] = data?.data?.data || [];
  const paginationData = data?.data?.pagination || data?.data; // Check depending on API response structure
  
  // Calculate total pages safely
  let totalPages = 1;
  if (paginationData?.total_pages) {
    totalPages = paginationData.total_pages;
  } else if (paginationData?.count) {
    totalPages = Math.ceil(paginationData.count / itemsPerPage);
  } else if (buildsList.length > 0) {
    totalPages = Math.ceil(buildsList.length / itemsPerPage);
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, isLockedFilter]);

  const handleViewBuild = (build: PcBuild) => {
    setSelectedBuild(build);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PC Builds</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage PC builds created by customers
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <Monitor className="w-4 h-4 text-[#e2ba2b]" />
            <span>{paginationData?.count ?? buildsList.length} Builds</span>
          </div>
        </div>
      </div>

      {/* Control Bar & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search builds..."
          className="w-full md:w-80"
        />

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none max-w-[160px]"
            >
              <option value="">All Statuses</option>
              <option value="Quote Requested">Quote Requested</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Locked Filter */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-gray-200">
            <select
              value={isLockedFilter}
              onChange={(e) => setIsLockedFilter(e.target.value)}
              className="bg-transparent font-medium text-gray-800 focus:outline-none max-w-[160px]"
            >
              <option value="">Any Lock Status</option>
              <option value="true">Locked</option>
              <option value="false">Unlocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Builds Table */}
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Build Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Price</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase">Lock Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 7 }).map((_, idx) => (
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
      ) : isError ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 mt-6 shadow-2xs">
          <div className="mt-4 text-red-600 font-semibold text-lg">Error loading PC Builds</div>
          <p className="text-gray-500 text-sm mt-1">Please try again later.</p>
        </div>
      ) : buildsList?.length ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Build Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Lock Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {buildsList.map((build, index) => (
                  <tr key={build.id || index} className="hover:bg-gray-50/60 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>

                    {/* Build Info */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div>
                        <span className="font-bold text-gray-900 block">{build.build_name || 'Unnamed Build'}</span>
                        <span className="text-xs text-gray-400 block mt-0.5">{build.id.substring(0, 8)}...</span>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700">
                      <div className="flex flex-col">
                        <span>{build.customer_details?.name || 'Unknown'}</span>
                        {build.customer_details?.contact_number && (
                          <span className="text-xs font-normal text-gray-500">{build.customer_details.contact_number}</span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                      ₹{Number(build.cached_total_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-[#c49e1e] border border-amber-200">
                        {build.status}
                      </span>
                    </td>

                    {/* Lock Status */}
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {build.is_locked ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                          Unlocked
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewBuild(build)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors shadow-2xs"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
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
          )}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 mt-6 shadow-2xs">
          <img className="size-44 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Builds" />
          <div className="mt-4 text-gray-900 font-semibold text-lg">No PC Builds Found</div>
          <p className="text-gray-500 text-sm mt-1">There are no PC Builds matching your criteria.</p>
        </div>
      )}

      {/* Build Details Modal */}
      {selectedBuild && (
        <BuildDetailsModal
          build={selectedBuild}
          onClose={() => setSelectedBuild(null)}
        />
      )}
    </div>
  );
}
