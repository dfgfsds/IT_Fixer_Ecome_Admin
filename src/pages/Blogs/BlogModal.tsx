

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { postBlogsApi, putBlogsApi } from "../../Api-Service/Apis";
import SingleImageUpload from "../../components/products/SingleImageUpload";
import { useParams } from "react-router-dom";
import { InvalidateQueryFilters, useQueryClient } from "@tanstack/react-query";
import ReactQuill from "react-quill";

function BlogModal({ open, close, userId, editData }: any) {
    if (!open) return null;
    const [apiError, setApiError] = useState("");
    const [images, setImages] = useState<any[]>([]);
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const blogSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        subtitle: Yup.string().required("Subtitle is required"),
        description: Yup.string().required("Description is required"),
        content: Yup.string().required("Content is required"),
        author: Yup.string().required("Author is required"),
        url_slug: Yup.string().nullable(),
        meta_title: Yup.string().nullable(),
        meta_description: Yup.string().nullable(),
        canonical_tag: Yup.string().nullable(),
        robots_tag: Yup.string().nullable(),
        url_description: Yup.string().nullable(),
        og_tags: Yup.string().nullable(),
        twitter_tags: Yup.string().nullable(),
        image_src_tags: Yup.string().nullable(),
        schema: Yup.string().nullable(),
    });

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(blogSchema),
        defaultValues: {
            title: "",
            subtitle: "",
            description: "",
            content: "",
            author: "",
            url_slug: "",
            meta_title: "",
            meta_description: "",
            canonical_tag: "",
            robots_tag: "",
            url_description: "",
            og_tags: "",
            twitter_tags: "",
            image_src_tags: "",
            schema: "",
        },
    });

    useEffect(() => {
        if (editData) {
            setValue("title", editData?.title || "");
            setValue("subtitle", editData?.subtitle || "");
            setValue("description", editData?.description || "");
            setValue("content", editData?.content || "");
            setValue("author", editData?.author || "");
            setValue("url_slug", editData?.url_slug || "");
            setValue("meta_title", editData?.meta_title || "");
            setValue("meta_description", editData?.meta_description || "");
            setValue("canonical_tag", editData?.canonical_tag || "");
            setValue("robots_tag", editData?.robots_tag || "");
            setValue("url_description", editData?.url_description || "");
            setValue("og_tags", editData?.og_tags || "");
            setValue("twitter_tags", editData?.twitter_tags || "");
            setValue("image_src_tags", editData?.image_src_tags || "");
            setValue("schema", editData?.schema || "");

            if (editData?.banner_url) {
                setImages([{ url: editData?.banner_url }]);
            } else {
                setImages([]);
            }
        } else {
            reset({
                title: "",
                subtitle: "",
                description: "",
                content: "",
                author: "",
                url_slug: "",
                meta_title: "",
                meta_description: "",
                canonical_tag: "",
                robots_tag: "",
                url_description: "",
                og_tags: "",
                twitter_tags: "",
                image_src_tags: "",
                schema: "",
            });
            setImages([]);
        }
    }, [editData, setValue, reset]);

    const onSubmit = async (data: any) => {
        delete data?.banner_url;
        try {
            setApiError("");
            const payload = {
                ...data,
                banner_url: images[0]?.url || "",
                vendor: id,
                user: userId,
                likes: editData?.likes || 0,
            };
            if (editData) {
                const updateApi = await putBlogsApi(`${editData?.id}/`, {
                    ...payload,
                    updated_by: `Vendor${id}`,
                });
                if (updateApi) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            } else {
                const updateApi = await postBlogsApi('', {
                    ...payload,
                    created_by: `Vendor${id}`,
                });
                if (updateApi) {
                    reset();
                    close();
                    setImages([]);
                    queryClient.invalidateQueries(['getBlogsData'] as InvalidateQueryFilters);
                }
            }
        } catch (err: any) {
            setApiError(err?.response?.data?.message || err?.response?.data?.error || "Failed to save blog. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/50 backdrop-blur-sm transition-all duration-300">
            {/* Backdrop Dismiss Area */}
            <div
                className="fixed inset-0"
                onClick={close}
            />

            {/* Center Modal Dialog */}
            <div
                className="relative z-50 w-full max-w-4xl bg-[#ffffff] rounded-[32px] shadow-2xl border border-[#e5e7eb] overflow-hidden max-h-[92vh] flex flex-col my-auto transition-all transform animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Theme Gradient Accent Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#e2ba2b] via-[#d4a81e] to-[#fcd34d] flex-shrink-0" />

                {/* Header */}
                <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-8 py-5 border-b border-[#edf2f7] flex items-center justify-between flex-shrink-0">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#e2ba2b] shadow-sm shadow-[#e2ba2b]/50"></span>
                            <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">
                                {editData ? "Edit Blog Post" : "Create New Blog"}
                            </h2>
                        </div>
                        <p className="text-sm text-[#64748b] mt-1 pl-5">
                            {editData ? "Update the blog information, content, and SEO metadata" : "Fill in details to publish a new blog post with SEO optimization"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={close}
                        className="w-10 h-10 rounded-2xl bg-[#f1f5f9] hover:bg-amber-50 text-[#64748b] hover:text-[#e2ba2b] flex items-center justify-center transition-colors text-xl font-medium"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <div
                    className="flex-1 overflow-y-auto px-8 py-6 space-y-6"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    <form onSubmit={handleSubmit(onSubmit)} id="blog-form" className="space-y-6">

                        {/* Section 1: Basic Information */}
                        <div className="bg-[#f8fafc] rounded-[24px] p-6 border border-[#e5e7eb] space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-[#e2ba2b] text-white text-xs flex items-center justify-center font-bold shadow-sm shadow-[#e2ba2b]/30">1</span>
                                    <h3 className="text-base font-bold text-[#0f172a]">Basic Information</h3>
                                </div>
                                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">Required Info</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Title */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Blog Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("title")}
                                        placeholder="Enter engaging blog title..."
                                        className="w-full h-11 rounded-xl border border-[#dbe2ea] px-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                    />
                                    {errors.title?.message && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.title.message)}</p>
                                    )}
                                </div>

                                {/* Subtitle */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Subtitle <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("subtitle")}
                                        placeholder="Brief subtitle or tagline..."
                                        className="w-full h-11 rounded-xl border border-[#dbe2ea] px-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                    />
                                    {errors.subtitle?.message && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.subtitle.message)}</p>
                                    )}
                                </div>

                                {/* Author */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Author Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register("author")}
                                        placeholder="e.g. John Doe"
                                        className="w-full h-11 rounded-xl border border-[#dbe2ea] px-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                    />
                                    {errors.author?.message && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.author.message)}</p>
                                    )}
                                </div>

                                {/* URL Slug */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        URL Slug <span className="text-xs text-[#64748b] font-normal">(Optional permalink identifier)</span>
                                    </label>
                                    <div className="relative flex items-center">
                                        <span className="absolute left-3.5 text-xs text-[#94a3b8] font-mono select-none">/blogs/</span>
                                        <input
                                            {...register("url_slug")}
                                            placeholder="my-awesome-blog-post"
                                            className="w-full h-11 rounded-xl border border-[#dbe2ea] pl-16 pr-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                        />
                                    </div>
                                    {errors.url_slug?.message && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.url_slug.message)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Banner Image */}
                        <div className="bg-[#f8fafc] rounded-[24px] p-6 border border-[#e5e7eb] space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-[#e2ba2b] text-white text-xs flex items-center justify-center font-bold shadow-sm shadow-[#e2ba2b]/30">2</span>
                                    <h3 className="text-base font-bold text-[#0f172a]">Cover / Banner Image</h3>
                                </div>
                                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">Media</span>
                            </div>
                            <div className="bg-white p-4 rounded-2xl border border-[#edf2f7]">
                                <SingleImageUpload images={images} onChange={setImages} />
                            </div>
                        </div>

                        {/* Section 3: Article Content */}
                        <div className="bg-[#f8fafc] rounded-[24px] p-6 border border-[#e5e7eb] space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-[#e2ba2b] text-white text-xs flex items-center justify-center font-bold shadow-sm shadow-[#e2ba2b]/30">3</span>
                                    <h3 className="text-base font-bold text-[#0f172a]">Blog Content</h3>
                                </div>
                                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">Rich Text</span>
                            </div>

                            {/* Short Description */}
                            <div className="bg-white p-4 rounded-2xl border border-[#edf2f7] space-y-2">
                                <label className="block text-sm font-semibold text-[#0f172a]">
                                    Short Summary / Description <span className="text-red-500">*</span>
                                </label>
                                <div className="rounded-xl overflow-hidden border border-[#e2e8f0]">
                                    <Controller
                                        name="description"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <ReactQuill
                                                {...field}
                                                onChange={(value) => field.onChange(value)}
                                                value={field.value}
                                                theme="snow"
                                                placeholder="Write a brief overview of the post..."
                                            />
                                        )}
                                    />
                                </div>
                                {errors.description?.message && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.description.message)}</p>
                                )}
                            </div>

                            {/* Full Content */}
                            <div className="bg-white p-4 rounded-2xl border border-[#edf2f7] space-y-2">
                                <label className="block text-sm font-semibold text-[#0f172a]">
                                    Full Article Content <span className="text-red-500">*</span>
                                </label>
                                <div className="rounded-xl overflow-hidden border border-[#e2e8f0]">
                                    <Controller
                                        name="content"
                                        control={control}
                                        defaultValue=""
                                        render={({ field }) => (
                                            <ReactQuill
                                                {...field}
                                                onChange={(value) => field.onChange(value)}
                                                value={field.value}
                                                theme="snow"
                                                placeholder="Write full blog article here..."
                                            />
                                        )}
                                    />
                                </div>
                                {errors.content?.message && (
                                    <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.content.message)}</p>
                                )}
                            </div>
                        </div>

                        {/* Section 4: SEO & Meta Configuration */}
                        <div className="bg-[#f8fafc] rounded-[24px] p-6 border border-[#e5e7eb] space-y-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-gradient-to-r from-[#e2ba2b] to-[#d4a81e] text-white text-xs flex items-center justify-center font-bold shadow-sm shadow-[#e2ba2b]/30">4</span>
                                    <h3 className="text-base font-bold text-[#0f172a]">SEO & Meta Configuration</h3>
                                </div>
                                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-semibold border border-amber-200/60">Search Engine Optimization</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Meta Title */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Meta Title
                                    </label>
                                    <input
                                        {...register("meta_title")}
                                        placeholder="e.g. 10 Best Photography Tips | Brand Name"
                                        className="w-full h-11 rounded-xl border border-[#dbe2ea] px-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                    />
                                </div>

                                {/* Canonical Tag */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Canonical Tag (URL)
                                    </label>
                                    <input
                                        {...register("canonical_tag")}
                                        placeholder="https://example.com/blogs/blog-slug"
                                        className="w-full h-11 rounded-xl border border-[#dbe2ea] px-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                    />
                                </div>

                                {/* Meta Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Meta Description
                                    </label>
                                    <textarea
                                        {...register("meta_description")}
                                        rows={2}
                                        placeholder="Short summary for search results (recommended under 160 characters)..."
                                        className="w-full rounded-xl border border-[#dbe2ea] p-3 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition resize-none"
                                    />
                                </div>

                                {/* Robots Tag */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Robots Tag
                                    </label>
                                    <input
                                        {...register("robots_tag")}
                                        placeholder="e.g. index, follow"
                                        className="w-full h-11 rounded-xl border border-[#dbe2ea] px-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                    />
                                </div>

                                {/* Image Src Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Image Src Tags
                                    </label>
                                    <input
                                        {...register("image_src_tags")}
                                        placeholder="e.g. https://.../preview.jpg"
                                        className="w-full h-11 rounded-xl border border-[#dbe2ea] px-4 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition"
                                    />
                                </div>

                                {/* URL Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        URL Description
                                    </label>
                                    <textarea
                                        {...register("url_description")}
                                        rows={2}
                                        placeholder="Detailed description for the URL structure..."
                                        className="w-full rounded-xl border border-[#dbe2ea] p-3 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition resize-none"
                                    />
                                </div>

                                {/* OG Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Open Graph (OG) Tags
                                    </label>
                                    <textarea
                                        {...register("og_tags")}
                                        rows={3}
                                        placeholder="og:title, og:description, og:image..."
                                        className="w-full rounded-xl border border-[#dbe2ea] p-3 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition resize-none"
                                    />
                                </div>

                                {/* Twitter Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Twitter Card Tags
                                    </label>
                                    <textarea
                                        {...register("twitter_tags")}
                                        rows={3}
                                        placeholder="twitter:card, twitter:title, twitter:image..."
                                        className="w-full rounded-xl border border-[#dbe2ea] p-3 text-sm text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition resize-none"
                                    />
                                </div>

                                {/* Schema */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                                        Schema (Structured Data / JSON-LD)
                                    </label>
                                    <textarea
                                        {...register("schema")}
                                        rows={4}
                                        placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "BlogPosting",\n  "headline": "..." \n}`}
                                        className="w-full rounded-xl border border-[#dbe2ea] p-3 font-mono text-xs text-[#0f172a] bg-white outline-none focus:border-[#e2ba2b] focus:ring-1 focus:ring-[#e2ba2b] transition resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* API Error Box */}
                        {apiError && (
                            <div className="rounded-2xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-600 flex items-center gap-2.5">
                                <span className="text-base">⚠️</span>
                                <span>{apiError}</span>
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md px-8 py-5 border-t border-[#edf2f7] flex items-center justify-end gap-3.5 flex-shrink-0">
                    <button
                        type="button"
                        onClick={close}
                        className="px-6 h-12 rounded-2xl border border-[#e5e7eb] text-sm font-semibold text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition shadow-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="blog-form"
                        className="px-8 h-12 rounded-2xl bg-gradient-to-r from-[#e2ba2b] to-[#d4a81e] hover:from-[#d4a81e] hover:to-[#c49e1e] text-white text-sm font-semibold transition shadow-md shadow-[#e2ba2b]/25 hover:shadow-lg hover:shadow-[#e2ba2b]/35 flex items-center gap-2"
                    >
                        <span>{editData ? "Update Blog" : "Publish Blog"}</span>
                        <span>→</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BlogModal;

