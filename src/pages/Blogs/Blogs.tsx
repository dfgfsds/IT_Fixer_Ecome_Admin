import { useState } from "react";
import BlogModal from "./BlogModal";
import { deleteBlogsApi, getBlogsApi } from "../../Api-Service/Apis";
import { InvalidateQueryFilters, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { FileEdit, Loader2, Plus, Trash2, BookOpen } from "lucide-react";
import Button from "../../components/Button";
import EmptyBox from "../../assets/image/empty-box.png";
import { toast } from "react-toastify";

function Blogs({ userId }: any) {
  const [blogModal, setBlogModal] = useState(false);
  const { id } = useParams<{ id: string }>();
  const [editData, setEditData] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteData, setDeleteData] = useState<any>('');
  const queryClient = useQueryClient();

  const getBlogsData = useQuery({
    queryKey: ["getBlogsData", id],
    queryFn: () => getBlogsApi(`?vendor_id=${id}`),
  });

  const blogs = getBlogsData?.data?.data?.blogs;

  const confirmDelete = async () => {
    if (deleteData) {
      setLoading(true);
      try {
        const response = await deleteBlogsApi(`${deleteData?.id}`);
        if (response) {
          queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
          toast.success("Blog deleted successfully!");
          setDeleteModal(false);
          setDeleteData('');
        }
      } catch (err: any) {
        toast.error("Failed to delete blog. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-gray-200/80 shadow-2xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Blogs</h1>
          <p className="mt-1 text-sm text-gray-500">
            Publish and manage blog posts for your store
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-amber-200/60">
            <BookOpen className="w-4 h-4 text-[#e2ba2b]" />
            <span>{blogs?.length || 0} Blogs</span>
          </div>
          <Button
            onClick={() => {
              setEditData('');
              setBlogModal(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Blog
          </Button>
        </div>
      </div>

      {/* Blogs Grid */}
      {getBlogsData.isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-200/80 space-y-3 animate-pulse">
              <div className="h-36 bg-gray-200 rounded-xl" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : blogs?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {blogs?.map((blog: any) => (
            <div
              key={blog.id}
              className="group relative bg-white rounded-2xl shadow-2xs overflow-hidden border border-gray-200/80 hover:shadow-md hover:border-gray-300 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                  <img
                    src={blog?.banner_url || EmptyBox}
                    alt={blog?.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = EmptyBox;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Action overlay buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      className="p-2 rounded-xl bg-white/90 backdrop-blur-xs text-gray-700 hover:text-gray-900 hover:bg-white shadow-xs transition-all active:scale-95"
                      onClick={() => {
                        setEditData(blog);
                        setBlogModal(true);
                      }}
                      title="Edit Blog"
                    >
                      <FileEdit className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      className="p-2 rounded-xl bg-white/90 backdrop-blur-xs text-red-600 hover:bg-red-50 shadow-xs transition-all active:scale-95"
                      onClick={() => {
                        setDeleteData(blog);
                        setDeleteModal(true);
                      }}
                      title="Delete Blog"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center text-xs text-gray-500 font-medium">
                    <span className="text-amber-700 font-semibold truncate max-w-[120px]">{blog?.author || "Store Author"}</span>
                    <span className="mx-1.5">•</span>
                    <span>
                      {blog?.created_at ? new Date(blog.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : 'Recent'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900 line-clamp-1 group-hover:text-[#c49e1e] transition-colors" title={blog?.title}>
                    {blog?.title}
                  </h3>
                  {blog?.subtitle && (
                    <p className="text-xs font-semibold text-gray-500 line-clamp-1">
                      {blog?.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                    {blog?.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 shadow-2xs">
          <img className="size-44 mx-auto object-contain opacity-80" src={EmptyBox} alt="No Blogs" />
          <div className="mt-4 text-gray-900 font-semibold text-lg">No Blogs Published</div>
          <p className="text-gray-500 text-sm mt-1">Click "Add Blog" to create your first article.</p>
        </div>
      )}

      {/* Modal Components */}
      <BlogModal
        open={blogModal}
        close={() => setBlogModal(false)}
        userId={userId}
        editData={editData}
      />

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full border border-gray-100" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Blog</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-900">"{deleteData?.title}"</span>? This action cannot be undone.
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

export default Blogs;