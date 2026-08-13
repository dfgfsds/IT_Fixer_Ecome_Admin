export interface CategoryDetail {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  status?: string;
}

export interface AttributeDetail {
  id: string;
  name: string;
  slug?: string;
  data_type?: string;
  unit?: string;
  status?: string;
}

export interface CategoryAttribute {
  id: string;
  category: CategoryDetail;
  attribute: AttributeDetail;
  created_at?: string;
  created_by?: string;
  updated_at?: string | null;
  updated_by?: string | null;
  is_required: boolean;
  display_order: number;
}

export interface CategoryAttributeForm {
  category_id: string;
  attribute_id: string;
  is_required: boolean;
  display_order: number;
  created_by?: string;
}
