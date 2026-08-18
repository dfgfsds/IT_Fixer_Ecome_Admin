import React from 'react';
import { X, User, DollarSign, Package, FileText, Download } from 'lucide-react';
import Button from '../Button';
import { PcQuotation } from '../../types/pcQuotation';
import EmptyBox from '../../assets/image/empty-box.png';

interface QuotationDetailsModalProps {
  quotation: PcQuotation;
  onClose: () => void;
}

export default function QuotationDetailsModal({
  quotation,
  onClose,
}: QuotationDetailsModalProps) {
  const { build_details: build } = quotation;

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 my-8 border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 mt-2">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-50 text-[#c49e1e] border border-amber-200/60 rounded-full">
                  {quotation.status}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {quotation.quotation_number}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{quotation.build_name || build?.build_name}</h3>
              <p className="text-xs font-mono text-gray-400 mt-1">ID: {quotation.id}</p>
            </div>
            
            {quotation.pdf_url && (
              <a 
                href={quotation.pdf_url} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 rounded-xl font-semibold transition-colors shadow-2xs border border-blue-200/50"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-100 flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="block text-xs font-semibold text-gray-500 uppercase">Customer</span>
                <span className="block text-sm font-bold text-gray-900 mt-0.5 truncate">{quotation.customer_details?.name || 'Unknown'}</span>
                <span className="block text-xs text-gray-600 mt-0.5 truncate">{quotation.customer_details?.email}</span>
                <span className="block text-xs text-gray-600 mt-0.5">{quotation.customer_details?.contact_number}</span>
              </div>
            </div>

            {/* Price Details */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100/50 flex items-start gap-3">
              <div className="p-2 bg-emerald-100/80 text-emerald-700 rounded-lg shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="block text-xs font-semibold text-emerald-600 uppercase">Quotation Summary</span>
                <div className="mt-1.5 space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-medium">₹{Number(quotation.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Tax ({quotation.tax_percentage}%):</span>
                    <span className="font-medium">₹{Number(quotation.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {Number(quotation.discount) > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-medium">-₹{Number(quotation.discount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="pt-1 mt-1 border-t border-emerald-200/60 flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-900">Grand Total:</span>
                    <span className="text-lg font-extrabold text-emerald-700">
                      ₹{Number(quotation.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Build Items */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-[#e2ba2b]" />
              <span>Included Components ({build?.items?.length || 0})</span>
            </h4>

            {build?.items && build.items.length > 0 ? (
              <div className="space-y-3">
                {build.items.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.component_details?.image || EmptyBox}
                        alt={item.component_details?.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = EmptyBox;
                        }}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-100"
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-900 block">{item.component_details?.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{item.component_details?.brand || 'No Brand'}</span>
                          <span className="text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="block text-sm font-bold text-gray-900">
                        ₹{Number(item.component_details?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      {item.quantity > 1 && (
                        <span className="block text-xs text-gray-500 mt-0.5">
                          Total: ₹{(Number(item.component_details?.price || 0) * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500">No components found for this quotation.</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
