import { Loader2, Pencil, Trash2, Ticket, Plus } from "lucide-react";
import formatDateTime from "../../lib/utils";
import { useState } from "react";
import { deleteCouponApi, GetCouponApi } from "../../Api-Service/authendication";
import { useParams } from "react-router-dom";
import { InvalidateQueryFilters, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/Button";
import CouponModal from "./CouponModal";
import EmptyBox from "../../assets/image/empty-box.png";
import { toast } from "react-toastify";

function Coupons({ userId }: any) {
  const [couponModal, setCouponModal] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [editData, setEditData] = useState<any>('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteData, setDeleteData] = useState<any>('');
  const queryClient = useQueryClient();

  const getCouponData = useQuery({
    queryKey: ['getCouponData', id],
    queryFn: () => GetCouponApi(`?vendor_id=${id}`)
  });

  const couponsList = getCouponData?.data?.data?.data;

  const confirmDelete = async () => {
    if (deleteData) {
      setLoading(true);
      try {
        const response = await deleteCouponApi(deleteData?.id, { deleted_by: `vendor${id}` });
        if (response) {
          queryClient.invalidateQueries(['getCouponData'] as InvalidateQueryFilters);
          toast.success("Coupon deleted successfully!");
          setDeleteModal(false);
          setDeleteData('');
        }
      } catch (err: any) {
        toast.error("Failed to delete coupon. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Coupons & Discounts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage promotional discount coupons for your store
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <Ticket className="w-4 h-4 text-[#e2ba2b]" />
            <span>{couponsList?.length || 0} Coupons</span>
          </div>
          <Button onClick={() => { setEditData(''); setCouponModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
          </Button>
        </div>
      </div>

      {/* Coupons Grid */}
      {getCouponData.isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-200/80 space-y-3 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : couponsList?.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {couponsList?.map((coupon: any) => (
            <div
              key={coupon.id}
              className="relative bg-white rounded-2xl border border-dashed border-amber-300/80 shadow-2xs p-6 hover:shadow-md hover:border-amber-400 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Header Badges & Actions */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 text-[#c49e1e] font-mono font-bold text-sm rounded-xl tracking-wider uppercase shadow-2xs">
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span>{coupon?.code || "COUPON"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    className="p-1.5 rounded-lg bg-amber-50 text-[#c49e1e] hover:bg-amber-100 transition-colors shadow-2xs"
                    title="Edit Coupon"
                    onClick={() => { setEditData(coupon); setCouponModal(true); }}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors shadow-2xs"
                    title="Delete Coupon"
                    onClick={() => { setDeleteData(coupon); setDeleteModal(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {coupon?.description || "No description provided"}
              </p>

              {/* Offer Badge */}
              <div className="mb-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500 uppercase tracking-wider">Discount</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {coupon?.discount_type === "percentage" && `${coupon?.discount_value}% OFF`}
                  {coupon?.discount_type === "flat" && `₹${coupon?.flat_discount} OFF`}
                  {coupon?.discount_type === "delivery" && `₹${coupon?.delivery_discount} Free Shipping`}
                  {!['percentage', 'flat', 'delivery'].includes(coupon?.discount_type) && (coupon?.discount_type || 'Active')}
                </span>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-gray-100 pt-3 text-gray-600">
                <div>
                  <span className="font-semibold block text-gray-400 uppercase text-[10px]">Start Date</span>
                  <span className="font-medium text-gray-800">{formatDateTime(coupon?.start_date)}</span>
                </div>
                <div>
                  <span className="font-semibold block text-gray-400 uppercase text-[10px]">Expiry Date</span>
                  <span className="font-medium text-gray-800">{formatDateTime(coupon?.expiry_date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <img className="size-44 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Coupons" />
          <div className="mt-4 text-gray-900 font-semibold text-lg">No Coupons Found</div>
          <p className="text-gray-500 text-sm mt-1">Create your first coupon code to boost store sales.</p>
        </div>
      )}

      {/* Modal Components */}
      {couponModal && (
        <CouponModal
          close={() => setCouponModal(false)}
          editData={editData}
          userId={userId}
          setEditData={setEditData}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Coupon</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete coupon <span className="font-bold text-gray-900">"{deleteData?.code}"</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteData('');
                  setDeleteModal(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-xs flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Coupons;
