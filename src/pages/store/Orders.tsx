import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button';
import Search from '../../components/Search';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import OrderDetailsModal from '../../components/orders/OrderDetailsModal';
import { Order, OrderStatus } from '../../types/order';
import { getVendorOrderApi } from '../../Api-Service/Apis';
import { useQuery } from '@tanstack/react-query';
import { Pagination } from '../Pagination';
import { Download, Eye, ShoppingBag } from 'lucide-react';
import EmptyBox from '../../assets/image/empty-box.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

export default function Orders() {
  const { id } = useParams<{ id: string }>();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading }: any = useQuery({
    queryKey: ['getVendorOrder', id],
    queryFn: () => getVendorOrderApi(`vendor/${id}`)
  });

  const sortedOrders = data?.data
    ?.slice()
    ?.sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const filteredOrders = sortedOrders?.filter((order: any) =>
    order?.consumer_address?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order?.consumer_address?.email_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order?.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order?.total_amount?.toString().includes(searchTerm) ||
    order?.id?.toString().includes(searchTerm)
  );

  const totalPages = Math.ceil((filteredOrders?.length || 0) / itemsPerPage);
  const paginatedItems = filteredOrders?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDownloadExcel = () => {
    if (!filteredOrders?.length) {
      toast.info('No Orders to download!');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'Orders.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage customer orders, track statuses and order details
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
          <ShoppingBag className="w-4 h-4 text-[#e2ba2b]" />
          <span>{filteredOrders?.length || 0} Total Orders</span>
        </div>
      </div>

      {/* Search & Export Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <Search
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search orders by ID, customer name, email or status..."
          className="w-full sm:w-96"
        />
        <Button variant="outline" onClick={handleDownloadExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 7 }).map((_, idx) => (
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
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedItems?.map((order: any, index: number) => (
                      <tr key={order.id || index} className="hover:bg-gray-50/60 transition-colors">
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                          #{order.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-800">
                          {order?.consumer_address?.customer_name || 'Guest Customer'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                          {order?.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                          ₹{Number(order?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <OrderStatusBadge status={order?.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            View Details
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
              <img className="size-48 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Orders" />
              <div className="mt-4 text-gray-900 font-semibold text-lg">No Orders Found</div>
              <p className="text-gray-500 text-sm mt-1">Orders placed by customers will appear here.</p>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={setSelectedOrder}
        />
      )}
    </div>
  );
}