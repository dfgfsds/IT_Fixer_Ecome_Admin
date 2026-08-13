import React, { useEffect, useState } from 'react';
import { Plus, ChevronRight, Loader2, Download, Edit2, Trash2, FolderPlus, Folder } from 'lucide-react';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Search from '../../components/Search';
import { Category } from '../../types/product';
import { deleteCategoriesApi, getCategoriesWithSubcategoriesApi, postCategoriesApi, updateCategoriesApi } from '../../Api-Service/Apis';
import { InvalidateQueryFilters, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Pagination } from '../Pagination';
import EmptyBox from '../../assets/image/empty-box.png';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useParams } from 'react-router-dom';
import SingleImageUpload from '../../components/products/SingleImageUpload';
import { toast } from 'react-toastify';

export default function Categories() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>();
  const [categoryForm, setCategoryForm] = useState<any>();
  const queryClient = useQueryClient();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const { id } = useParams<{ id: string }>();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [categoriesModal, setCategoriesDeleteModal] = useState(false);
  const [categoriesId, setCategoriesId] = useState<any>();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      vendor: "",
      name: "",
      parent: "",
      depth: 0,
      description: "",
      image: null,
      created_by: "",
      slug_name: "",
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ["getCategoriesWithSubcategoriesData", id],
    queryFn: () => getCategoriesWithSubcategoriesApi(`vendor/${id}/`),
  });

  const filteredCategories = data?.data?.filter((category: any) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories?.some((sub: any) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil((filteredCategories?.length || 0) / itemsPerPage);
  const paginatedItems = filteredCategories?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMessage('');
    try {
      let payload: any = {
        vendor: id,
        name: data?.name,
        parent: categoryForm ? categoryForm : data?.parent || '',
        depth: categoryForm ? 1 : data?.depth || 0,
        description: data?.description,
        created_by: 'vendor9',
        image: images ? images[0]?.url : '',
        slug_name: data?.slug_name,
      };

      if (selectedCategory) {
        const editPayload = {
          parent: data?.parent || '',
          depth: data?.depth,
          description: data?.description,
          updated_by: 'vendor9',
          name: data?.name,
          image: images ? images[0]?.url : '',
          slug_name: data?.slug_name,
        };

        const updateApi = await updateCategoriesApi(`${selectedCategory?.id}/`, editPayload);
        if (updateApi) {
          queryClient.invalidateQueries(['getCategoriesWithSubcategoriesData'] as InvalidateQueryFilters);
          setCategoriesId('');
          setSelectedCategory('');
          setCategoryForm('');
          reset();
          setIsModalOpen(false);
          setImages([]);
          toast.success("Category updated successfully!");
        }
      } else {
        const postApi = await postCategoriesApi('', payload);
        if (postApi) {
          queryClient.invalidateQueries(['getCategoriesWithSubcategoriesData'] as InvalidateQueryFilters);
          setCategoriesId('');
          setSelectedCategory('');
          setCategoryForm('');
          reset();
          setIsModalOpen(false);
          setImages([]);
          toast.success("Category created successfully!");
        }
      }
    } catch (error: any) {
      if (error?.response?.data) {
        const errObj = error.response.data;
        const [key, value] = Object.entries(errObj)[0] || [];
        const firstMessage = Array.isArray(value) ? value[0] : value;
        setErrorMessage(`${key}: ${firstMessage}`);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (selectedCategory) {
      setValue('name', selectedCategory?.name);
      setValue('vendor', selectedCategory?.vendor);
      setValue('parent', selectedCategory?.parent);
      setValue('description', selectedCategory?.description);
      setValue('depth', selectedCategory?.depth);
      setImages(selectedCategory?.image ? [selectedCategory?.image] : []);
      setValue('slug_name', selectedCategory?.slug_name);
    }
  }, [selectedCategory, setValue]);

  const handleDelete = async () => {
    try {
      const updateApi = await deleteCategoriesApi(`${categoriesId?.id}/`, { deleted_by: 'vendor' });
      if (updateApi) {
        queryClient.invalidateQueries(['getCategoriesWithSubcategoriesData'] as InvalidateQueryFilters);
        toast.success("Category deleted successfully!");
        setCategoriesDeleteModal(false);
        setCategoriesId('');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Something went wrong. Please try again!");
    } finally {
      setCategoriesDeleteModal(false);
    }
  };

  const renderCategoryRow = (category: any, isSubcategory = false, parentIndex = 0) => (
    <tr key={category.id} className="hover:bg-gray-50/60 transition-colors">
      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
        <div className={`flex items-center gap-3 ${isSubcategory ? 'pl-6' : ''}`}>
          {isSubcategory ? (
            <ChevronRight className="h-4 w-4 text-amber-500 shrink-0" />
          ) : (
            <Folder className="h-4 w-4 text-gray-400 shrink-0" />
          )}
          {category.image && (
            <img
              src={typeof category.image === 'string' ? category.image : category.image?.url}
              alt={category.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = EmptyBox;
              }}
              className="h-9 w-9 rounded-lg object-cover border border-gray-200 bg-gray-50 shrink-0 shadow-2xs"
            />
          )}
          <span className={`font-semibold ${isSubcategory ? 'text-gray-700' : 'text-gray-900'}`}>
            {category.name}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
        <p className="truncate" title={category.description}>
          {category.description || '-'}
        </p>
      </td>
      <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleEdit(category)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#c49e1e] bg-amber-50/80 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          {!isSubcategory && (
            <button
              onClick={() => {
                setCategoryForm(category?.id);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-2xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              Subcategory
            </button>
          )}
          <button
            onClick={() => {
              setCategoriesId(category);
              setCategoriesDeleteModal(true);
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

  const handleDownloadExcel = () => {
    if (!filteredCategories?.length) {
      toast.info('No Categories to download!');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredCategories);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'categories.xlsx');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your store's product categories and hierarchical subcategories
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setCategoryForm(null);
              reset();
              setImages([]);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
        <Search
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search categories or subcategories..."
          className="w-full sm:w-80"
        />
        <Button variant="outline" onClick={handleDownloadExcel}>
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Categories Table Area */}
      {isLoading ? (
        <div className="mt-6 flex flex-col">
          <div className="overflow-x-auto shadow-sm ring-1 ring-black/5 rounded-2xl bg-white scrollbar-thin">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category Name</th>
                  <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {[...Array(5)].map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 3 }).map((_, idx) => (
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
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category Name</th>
                          <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {paginatedItems?.map((category: any, idx: number) => (
                          <React.Fragment key={category.id || idx}>
                            {renderCategoryRow(category, false, idx)}
                            {category.subcategories?.map((subcategory: any) =>
                              renderCategoryRow(subcategory, true, idx)
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
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
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 mt-6 shadow-2xs">
              <img className="size-48 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Categories" />
              <div className="mt-4 text-gray-900 font-semibold text-lg">No Categories Found</div>
              <p className="text-gray-500 text-sm mt-1">Add your first store category to get started.</p>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 my-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {selectedCategory
                    ? "Edit Category"
                    : categoryForm
                    ? "Add Subcategory"
                    : "Add Category"}
                </h3>
              </div>

              <Input label="Name" required {...register("name", { required: true })} />
              <Input label="Slug Name" required {...register("slug_name", { required: true })} />

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Description <span className="text-red-500 ml-0.5">*</span>
                </label>
                <textarea
                  {...register("description", { required: true })}
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300/80 rounded-xl shadow-2xs focus:border-[#e2ba2b] focus:outline-none focus:ring-2 focus:ring-[#e2ba2b]/20"
                  placeholder="Enter category description..."
                />
              </div>

              <SingleImageUpload required images={images} onChange={setImages} />

              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                  {errorMessage}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSelectedCategory(null);
                    setCategoryForm(null);
                    setIsModalOpen(false);
                    setImages([]);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {selectedCategory ? "Save Changes" : "Add Category"}
                  {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {categoriesModal && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{categoriesId?.name}"</span>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setCategoriesDeleteModal(false)}
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
      )}
    </div>
  );
}