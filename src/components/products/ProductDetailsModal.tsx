import React from 'react';
import { Trash2Icon, X } from 'lucide-react';
import Button from '../Button';
import { InvalidateQueryFilters, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSizesApi, getVariantsProductApi } from '../../Api-Service/Apis';
import axios from 'axios';
import ApiURl from '../../Api-Service/ApiUrls';
import { toast } from 'react-toastify';
interface ProductDetailsModalProps {
  product: any;
  onClose: () => void;
  onEdit: () => void;
}

export default function ProductDetailsModal({ product, onClose, onEdit }: ProductDetailsModalProps) {
  const [confirmData, setConfirmData] = React.useState<{ id: string, type: 'size' | 'variant' } | null>(null);
  const queryClient = useQueryClient();

  const productId: any = product?.id;
  const VariantData: any = useQuery({
    queryKey: ['VariantData'],
    queryFn: () => getVariantsProductApi(`/product/${productId}`),
  });

  const sizesData: any = useQuery({
    queryKey: ['getSizesData'],
    queryFn: () => getSizesApi(`/product/${productId}`),
  });

  const handleConfirmDelete = async () => {
    if (!confirmData) return;
    const { id, type } = confirmData;
    try {
      const updateApi = await axios.delete(
        type === "size"
          ? `${ApiURl?.sizes}/${id}/`
          : `${ApiURl?.variants}/${id}/`,
        { data: { deleted_by: "admin" } }
      );
      if (updateApi) {
        queryClient.invalidateQueries(['VariantData'] as InvalidateQueryFilters);
        queryClient.invalidateQueries(['getSizesData'] as InvalidateQueryFilters);
        toast.success(
          `${type === "size" ? "Size" : "Variant"} deleted successfully!`
        );
        setConfirmData(null); // Close modal
      }
    } catch (error) {
      toast.error(`Failed to delete ${type}`);
      console.error(error);
    }
  };

  const handleUpdateVariant = async (variant: any) => {
    try {
      const updateApi = await axios.put(`${ApiURl?.variants}/${variant.id}/`,
        {
          product_variant_status: !variant.product_variant_status,
          updated_by: 'admin'
        })
      if (updateApi) {
        queryClient.invalidateQueries(['VariantData'] as InvalidateQueryFilters);

      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'something went wrong, please try again later')
    }
  }


  const handleUpdateSize = async (size: any) => {
    try {
      const updateApi = await axios.put(`${ApiURl?.sizes}/${size?.id}/`,
        {
          product_size_status: !size.product_size_status,
          updated_by: 'admin'
        })
      if (updateApi) {
        queryClient.invalidateQueries(['getSizesData'] as InvalidateQueryFilters);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'something went wrong, please try again later')
    }
  }

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div>
            <div className="aspect-w-3 aspect-h-2 mb-4">
              <img
                src={product?.image_urls[0] ? product?.image_urls[0] : "https://media.istockphoto.com/id/1222357475/vector/image-preview-icon-picture-placeholder-for-website-or-ui-ux-design-vector-illustration.jpg?s=612x612&w=0&k=20&c=KuCo-dRBYV7nz2gbk4J9w1WtTAgpTdznHu55W9FjimE="}
                // src={product.images.find(img => img.isPrimary)?.url || product.images[0]?.url}
                alt={product?.name}
                className="h-64 w-full object-cover rounded-lg"
              />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">{product?.name} <span className='text-slate-600 ml-3'>
              {/* {product?.weight} g */}
              {product?.brand_name}
            </span></h3>
            {/* <p className="mt-1 text-sm text-gray-500">{product?.description}</p> */}
            <div dangerouslySetInnerHTML={{ __html: product?.description }} className=" quill-content" />


            <div className="mt-4">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">₹{product?.price}</span>
                {product?.discount && (
                  <span className="ml-2 text-lg text-gray-500 line-through">
                    ₹{product?.discount}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6">
              {VariantData?.data?.data?.message?.length || sizesData?.data?.data?.message?.length ? (
                <h4 className="text-lg font-bold text-gray-900 mb-2">Available Varieties</h4>
              ) : ''}


              <div className="mt-2 space-y-4">
                {VariantData?.data?.data?.message?.map((variant: any, index: number) => (
                  <div
                    key={index}
                    className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition"
                  >
                    {/* VARIANT HEADER */}
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {variant?.product_variant_title}
                      </h3>

                      <div className="flex items-center gap-3">
                        <div
                          onClick={() => handleUpdateVariant(variant)}
                          className={`relative w-12 h-6 rounded-full cursor-pointer transition
    ${variant.product_variant_status ? "bg-green-500" : "bg-gray-300"}
  `}
                        >
                          <span
                            className={`absolute top-[2px] left-[2px] h-5 w-5 bg-white rounded-full transition-transform
      ${variant.product_variant_status ? "translate-x-6" : ""}
    `}
                          />
                        </div>

                        {/* DELETE VARIANT */}
                        <button
                          onClick={() =>
                            setConfirmData({ id: variant?.id, type: "variant" })
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2Icon size={18} />
                        </button>
                      </div>
                    </div>

                    {/* BODY */}
                    <div className="flex gap-6 items-start">
                      {/* IMAGE */}
                      <div className="h-28 w-28 rounded-xl overflow-hidden border bg-gray-100 flex-shrink-0">
                        {variant?.product_variant_image_urls?.length > 0 ? (
                          <img
                            src={variant.product_variant_image_urls[0]}
                            alt="Variant"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* SIZES GRID */}
                      <div className="grid grid-cols-2 gap-4 w-full max-w-[420px]">
                        {sizesData?.data?.data?.message
                          ?.filter((size: any) => size.variant_id === variant.id)
                          .map((size: any, sizeIndex: number) => (
                            <div
                              key={sizeIndex}
                              className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-xl"
                            >
                              {/* SIZE TEXT */}
                              <div className="flex flex-col leading-tight">
                                <span className="text-sm font-semibold text-gray-800 uppercase">
                                  {size.product_size}
                                </span>
                                {/* <span className="text-xs text-gray-500">
                                  Stock {size.product_size_stock_quantity}
                                </span> */}
                              </div>

                              {/* ACTIONS */}
                              <div className="flex items-center gap-3">
                                {/* TOGGLE */}
                                <div
                                  onClick={() => handleUpdateSize(size)}
                                  className={`relative w-9 h-5 rounded-full cursor-pointer transition
    ${size?.product_size_status ? "bg-green-500" : "bg-gray-300"}
  `}
                                >
                                  <span
                                    className={`absolute top-[2px] left-[2px] h-4 w-4 bg-white rounded-full transition-transform
      ${size?.product_size_status ? "translate-x-4" : ""}
    `}
                                  />
                                </div>


                                {/* DELETE */}
                                <button
                                  onClick={() =>
                                    setConfirmData({ id: size?.id, type: "size" })
                                  }
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2Icon size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                  </div>
                ))}
              </div>



            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button onClick={onEdit}>Edit Product</Button>
          </div>
        </div>
      </div>

      {confirmData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this {confirmData.type}?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmData(null)}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}