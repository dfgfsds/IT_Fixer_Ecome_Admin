export interface PcCategory {
  id?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  delete_status?: boolean;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  status: string; // "Active" | "Inactive"
}

export interface PcCategoryForm {
  name: string;
  slug: string;
  icon: string;
  description: string;
  status: string;
  created_by?: string;
}
