export interface Attribute {
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
  data_type: string; // e.g. "Integer", "String", "Float", "Boolean"
  unit?: string;     // e.g. "MB/s", "W", "GB", "MHz"
  status: string;    // "Active" | "Inactive"
}

export interface AttributeForm {
  name: string;
  slug: string;
  data_type: string;
  unit: string;
  status: string;
  created_by: any;
}
