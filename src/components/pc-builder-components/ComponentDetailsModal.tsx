import React from 'react';
import { X, Cpu, Tag, Box, DollarSign, Layers } from 'lucide-react';
import Button from '../Button';
import { PcComponent } from '../../types/pcComponent';
import EmptyBox from '../../assets/image/empty-box.png';

interface ComponentDetailsModalProps {
  component: PcComponent;
  onClose: () => void;
  onEdit: () => void;
}

export default function ComponentDetailsModal({
  component,
  onClose,
  onEdit,
}: ComponentDetailsModalProps) {
  const getCategoryName = () => {
    if (typeof component.category === 'object' && component.category?.name) {
      return component.category.name;
    }
    return 'Component Category';
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 my-8 border border-gray-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute right-4 top-4 z-10">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5">
          {/* Component Image */}
          <div className="w-full h-56 bg-gray-50 rounded-xl overflow-hidden border border-gray-200/80 flex items-center justify-center">
            <img
              src={component.image || EmptyBox}
              alt={component.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = EmptyBox;
              }}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Title & Badges */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {component.brand && (
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-amber-50 text-[#c49e1e] border border-amber-200/60 rounded-full">
                  {component.brand}
                </span>
              )}
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                {getCategoryName()}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  component.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {component.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-gray-900">{component.name}</h3>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{component.slug}</p>
          </div>

          {/* Description */}
          {component.description && (
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
              {component.description}
            </p>
          )}

          {/* Price & Stock Stats */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">Price</span>
              <span className="text-2xl font-extrabold text-gray-900">
                ₹{Number(component.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase">Stock Level</span>
              <span className="text-2xl font-extrabold text-gray-900">
                {component.stock ?? 0} <span className="text-xs font-normal text-gray-500">units</span>
              </span>
            </div>
          </div>

          {/* Technical Specifications / Attribute Values */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#e2ba2b]" />
              <span>Technical Specifications ({component.attribute_values?.length || 0})</span>
            </h4>

            {component.attribute_values && component.attribute_values.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {component.attribute_values.map((item, idx) => {
                  const attrName = typeof item.attribute === 'object' ? item.attribute.name : `Attribute #${item.attribute}`;
                  const attrUnit = typeof item.attribute === 'object' ? item.attribute.unit : '';
                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 bg-white rounded-xl border border-gray-200/80 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-gray-500 truncate max-w-[130px]" title={attrName}>
                        {attrName}
                      </span>
                      <span className="text-xs font-bold text-gray-900 bg-amber-50/80 text-amber-900 px-2 py-0.5 rounded-lg border border-amber-200/50">
                        {item.value} {attrUnit ? attrUnit : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200 text-center">
                No technical specifications assigned.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onEdit}>
              Edit Component
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
