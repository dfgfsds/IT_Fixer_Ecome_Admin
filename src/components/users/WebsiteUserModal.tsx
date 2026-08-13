import React, { useState } from 'react';
import { X, User, Phone, Mail, CheckCircle2 } from 'lucide-react';
import Button from '../Button';
import { WebsiteUser } from '../../types/user';
import OrderDetailsModal from '../orders/OrderDetailsModal';
import { Order } from '../../types/order';

interface WebsiteUserModalProps {
  user: WebsiteUser;
  onClose: () => void;
}

export default function WebsiteUserModal({ user, onClose }: WebsiteUserModalProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleUpdateOrderStatus = (status: Order['status']) => {
    console.log('Update order status:', status);
    setSelectedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute right-4 top-4 z-10">
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#e2ba2b] flex items-center justify-center border border-amber-100 font-bold text-lg">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
              <p className="text-xs text-gray-500">Registered website customer profile</p>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <User className="h-4 w-4 text-gray-400 shrink-0" />
              <span className="font-semibold text-gray-900">{user.name || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{user.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Phone className="h-4 w-4 text-gray-400 shrink-0" />
              <span>{user.mobileNumber || user.contact_number || 'N/A'}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
}