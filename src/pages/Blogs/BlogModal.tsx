import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { postBlogsApi, putBlogsApi } from "../../Api-Service/Apis";
import Input from "../../components/Input";
import SingleImageUpload from "../../components/products/SingleImageUpload";
import { useParams } from "react-router-dom";
import { InvalidateQueryFilters, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";
import { X, Loader2 } from "lucide-react";
import Button from "../../components/Button";

function BlogModal({ open, close, userId, editData }: any) {
    if (!open) return null;
    const [apiError, setApiError] = useState("");
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const blogSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        subtitle: Yup.string().required("Subtitle is required"),
        description: Yup.string().required("Description is required"),
        content: Yup.string().required("Content is required"),
        author: Yup.string().required("Author is required"),
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm({ resolver: yupResolver(blogSchema) });

    useEffect(() => {
        if (editData) {
            setValue("title", editData?.title || "");
            setValue("subtitle", editData?.subtitle || "");
            setValue("description", editData?.description || "");
            setValue("content", editData?.content || "");
            setValue("author", editData?.author || "");

            if (editData?.banner_url) {
                setImages([{ url: editData?.banner_url }]);
            }
        }
    }, [editData, setValue]);

    const onSubmit = async (data: any) => {
        delete data?.banner_url;
        setLoading(true);
        try {
            setApiError("");
            const payload = {
                ...data,
                banner_url: images[0]?.url || "",
                vendor: id,
                user: userId,
                likes: 0,
            };
            if (editData) {
                const response = await putBlogsApi(`${editData?.id}/`, payload);
                if (response) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            } else {
                const response = await postBlogsApi("", payload);
                if (response) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            }
        } catch (err: any) {
            setApiError(err?.response?.data?.message || "Failed to save blog. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-950/50 backdrop-blur-xs flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                        {editData ? "Edit Blog" : "Add New Blog"}
                    </h3>
                    <button
                        type="button"
                        onClick={close}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Input label="Title" {...register("title")} />
                        {errors.title?.message && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{String(errors.title.message)}</p>
                        )}
                    </div>

                    <div>
                        <Input label="Subtitle" {...register("subtitle")} />
                        {errors.subtitle?.message && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{String(errors.subtitle.message)}</p>
                        )}
                    </div>

                    <div>
                        <Input label="Author" {...register("author")} />
                        {errors.author?.message && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{String(errors.author.message)}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Short Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register("description")}
                            rows={3}
                            className="w-full px-3.5 py-2.5 bg-white text-sm text-gray-900 border border-gray-300/80 rounded-xl shadow-2xs focus:border-[#e2ba2b] focus:outline-none focus:ring-2 focus:ring-[#e2ba2b]/20"
                            placeholder="Enter short description..."
                        />
                        {errors.description?.message && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{String(errors.description.message)}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="content"
                            control={control}
                            render={({ field }) => (
                                <ReactQuill
                                    theme="snow"
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    className="bg-white rounded-xl border border-gray-300/80 overflow-hidden"
                                />
                            )}
                        />
                        {errors.content?.message && (
                            <p className="text-xs text-red-500 mt-1 font-medium">{String(errors.content.message)}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                            Banner Image
                        </label>
                        <SingleImageUpload images={images} onChange={setImages} />
                    </div>

                    {apiError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                            {apiError}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={close}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {editData ? "Update Blog" : "Submit Blog"}
                            {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin shrink-0" />}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BlogModal;