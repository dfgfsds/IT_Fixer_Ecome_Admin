import { useEffect, useState } from 'react';
import Button from '../../components/Button';
import Search from '../../components/Search';
import WebsiteUserModal from '../../components/users/WebsiteUserModal';
import { WebsiteUser } from '../../types/user';
import { getUserApi } from '../../Api-Service/Apis';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Pagination } from '../Pagination';
import { Download, Eye, Users } from 'lucide-react';
import EmptyBox from '../../assets/image/empty-box.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

export default function WebsiteUsers() {
  const [selectedUser, setSelectedUser] = useState<WebsiteUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data, isLoading }: any = useQuery({
    queryKey: ['getVendorOrder', id],
    queryFn: () => getUserApi(`?vendor_id=${id}`)
  });

  const filteredUsers = data?.data?.filter((user: any) =>
    user?.id?.toString()?.includes(searchTerm) ||
    user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    user?.contact_number?.toString()?.includes(searchTerm) ||
    user?.status?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  );

  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);
  const paginatedItems = filteredUsers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDownloadExcel = () => {
    if (!filteredUsers?.length) {
      toast.info('No Customers to download!');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Customers.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage your store's registered customers and their order history
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
          <Users className="w-4 h-4 text-[#e2ba2b]" />
          <span>{filteredUsers?.length || 0} Customers</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <Search
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search customers by name, email, or mobile..."
          className="w-full sm:w-96"
        />
        <Button variant="outline" onClick={handleDownloadExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Orders</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <td key={idx} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded-md animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {paginatedItems?.length ? (
            <div className="mt-6 flex flex-col">
              <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Mobile</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Orders</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedItems?.map((user: any, index: number) => (
                      <tr key={user.id || index} className="hover:bg-gray-50/60 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                          {user?.name || '--'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {user?.email || '--'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {user?.contact_number || '--'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                            {user.total_orders ?? 0} Orders
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                          <button
                            disabled={user?.total_orders === 0}
                            onClick={() => navigate(`singleOrder/${user?.id}`)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
                              user?.total_orders === 0
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Orders
                          </button>
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
                    onChange={(e: any) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 mt-6 shadow-2xs">
              <img className="size-48 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Customers" />
              <div className="mt-4 text-gray-900 font-semibold text-lg">No Customers Found</div>
              <p className="text-gray-500 text-sm mt-1">Registered customer records will appear here.</p>
            </div>
          )}
        </>
      )}

      {selectedUser && (
        <WebsiteUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}