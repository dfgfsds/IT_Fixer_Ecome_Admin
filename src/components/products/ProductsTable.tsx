import { useEffect, useState } from 'react';
import Button from '../Button';
import { Product } from '../../types/product';
import { Pagination } from '../../pages/Pagination';
import EmptyBox from '../../assets/image/empty-box.png';
import { deleteAllProductVariantSizeApi, productStatusUpdateApi } from '../../Api-Service/Apis';
import { toast } from 'react-toastify';
import { InvalidateQueryFilters, useQueryClient } from '@tanstack/react-query';
import { Eye, Edit2, Trash2 } from 'lucide-react';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  isLoading: boolean;
}

export default function ProductsTable({ products, onEdit, onView, isLoading }: ProductsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<any>();
  const totalPages = Math.ceil((products?.length || 0) / itemsPerPage);
  const queryClient = useQueryClient();

  const paginatedItems = products?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [products?.length]);

  const handleDelete = async () => {
    try {
      const updateApi = await deleteAllProductVariantSizeApi(`delete/${deleteId?.id}`, { deleted_by: 'vendor' });
      if (updateApi) {
        queryClient.invalidateQueries(['getAllProductVariantSizeData'] as InvalidateQueryFilters);
        queryClient.invalidateQueries(['getProductData'] as InvalidateQueryFilters);
        toast.success('Product deleted successfully');
        setDeleteModal(false);
        setDeleteId(null);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Something went wrong. Please try again!');
    } finally {
      setDeleteModal(false);
    }
  };

  const onToggleStatus = async (product: any) => {
    const newStatus = product?.status === true ? false : true;
    try {
      const updateApi = await productStatusUpdateApi(`${product?.id}`, {
        status: newStatus,
        updated_by: 'vendor'
      });
      if (updateApi) {
        queryClient.invalidateQueries(['getAllProductVariantSizeData'] as InvalidateQueryFilters);
        queryClient.invalidateQueries(['getProductData'] as InvalidateQueryFilters);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Something went wrong. Please try again!');
    }
  };

  const getProductImage = (product: any) => {
    if (!product) return EmptyBox;
    let urls = product.image_urls;
    if (!urls || (Array.isArray(urls) && urls.length === 0)) {
      urls = product.images || product.image;
    }
    if (typeof urls === 'string') {
      try {
        const parsed = JSON.parse(urls);
        if (Array.isArray(parsed) && parsed.length > 0) {
          urls = parsed;
        } else {
          return urls;
        }
      } catch {
        if (urls.startsWith('http://') || urls.startsWith('https://') || urls.startsWith('/')) {
          return urls;
        }
      }
    }
    if (Array.isArray(urls) && urls.length > 0) {
      const first = urls[0];
      if (typeof first === 'string' && first.trim() !== '') {
        return first;
      }
      if (typeof first === 'object' && first?.url) {
        return first.url;
      }
    }
    return EmptyBox;
  };

  return (
    <>
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">S.No</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
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
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Brand</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {paginatedItems?.map((product: any, index: number) => {
                      const imgSrc = getProductImage(product);
                      return (
                        <tr key={product.id || index} className="hover:bg-gray-50/60 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-500">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-3">
                              <img
                                src={imgSrc}
                                alt={product.name || 'Product'}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = EmptyBox;
                                }}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0 shadow-2xs"
                              />
                              <div className="font-semibold text-gray-900 truncate max-w-xs" title={product.name}>
                                {product.name?.length > 28 ? `${product.name.slice(0, 28)}...` : product.name}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-700">
                            {product.brand_name || '-'}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-900">
                            ₹{Number(product.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${(product.stock_quantity || 0) > 10
                              ? 'bg-emerald-50 text-emerald-700'
                              : (product.stock_quantity || 0) > 0
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                              }`}>
                              {product.stock_quantity ?? 0}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                            <label className="inline-flex items-center cursor-pointer select-none">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={product?.status === true}
                                onChange={() => onToggleStatus(product)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-500 relative transition-colors duration-200">
                                <span
                                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-xs ${product?.status === true ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                              </div>
                            </label>
                          </td>

                          <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => onView(product)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                              <button
                                onClick={() => onEdit(product)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#c49e1e] bg-amber-50/80 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteId(product);
                                  setDeleteModal(true);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50/80 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-2xs"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
                  </select>
                </div>
              </div>
            </div>

          ) : (
            <div className="py-12 text-center bg-white rounded-xl border border-gray-200 mt-8 shadow-xs">
              <img className="size-48 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Products" />
              <div className="mt-4 text-gray-700 font-semibold text-lg">No Products Found</div>
              <p className="text-gray-500 text-sm mt-1">Try searching for a different keyword or add a new product.</p>
            </div>
          )}
        </>
      )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteModal && (
          <div className="fixed inset-0 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteId?.name}"</span>? This action cannot be undone.
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
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-xs"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}