import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Plus, Package } from 'lucide-react';
import Button from '../../components/Button';
import Search from '../../components/Search';
import ProductModal from '../../components/products/ProductModal';
import ProductsTable from '../../components/products/ProductsTable';
import ProductDetailsModal from '../../components/products/ProductDetailsModal';
import { Product } from '../../types/product';
import { getAllProductVariantSizeApi } from '../../Api-Service/Apis';
import { useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

export default function Products() {
  const { id } = useParams<{ id: string }>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [productForm, setProductForm] = useState<any>();
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading }: any = useQuery({
    queryKey: ['getAllProductVariantSizeData', id],
    queryFn: () => getAllProductVariantSizeApi(`?vendor_id=${id}`)
  });

  const handleAddProduct = () => {
    setProductForm(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setProductForm(product);
    setIsEditing(true);
    setIsModalOpen(true);
    setSelectedProduct(null);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setProductForm(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    closeModal();
  };

  const filteredProducts: Product[] = data?.data?.filter((product: any) => {
    const term: any = searchTerm.toLowerCase();
    return (
      product?.name?.toLowerCase()?.includes(term) ||
      product?.description?.toLowerCase()?.includes(term) ||
      product?.price?.toString()?.includes(term) ||
      product?.brand_name?.toLowerCase()?.includes(term)
    );
  }) || [];

  const handleDownloadExcel = () => {
    if (!filteredProducts.length) {
      toast.info('No products to download!');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blobData = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blobData, 'products.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store's products, pricing, stock levels and varieties
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <Package className="w-4 h-4 text-[#e2ba2b]" />
            <span>{filteredProducts?.length || 0} Products</span>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <Search
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search products by name, brand or price..."
          className="w-full sm:w-80"
        />
        <Button variant="outline" onClick={handleDownloadExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <ProductModal
          productForm={productForm}
          onClose={closeModal}
          onSubmit={handleSubmit}
          onChange={(updates) => setProductForm(updates)}
        />
      )}

      {selectedProduct && (
        <ProductDetailsModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => handleEditProduct(selectedProduct)}
        />
      )}

      {/* Table */}
      <ProductsTable
        isLoading={isLoading}
        products={filteredProducts || []}
        onEdit={handleEditProduct}
        onView={handleViewProduct}
      />
    </div>
  );
}