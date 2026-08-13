export interface AttributeValueItem {
  id?: string;
  attribute: {
    id: string;
    name: string;
    slug?: string;
    data_type?: string;
    unit?: string;
    status?: string;
  } | string;
  value: string;
  component?: string;
}

export interface CategoryDetail {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  status?: string;
}

export interface PcComponent {
  id: string;
  category?: CategoryDetail | string;
  category_id?: string;
  brand: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  price: number | string;
  stock: number;
  status: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string | null;
  updated_by?: string | null;
  attribute_values?: AttributeValueItem[];
}

export interface AttributeValuePayload {
  attribute: string;
  value: string;
}

export interface PcComponentForm {
  category_id: string;
  brand: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  price: number;
  stock: number;
  status: string;
  created_by?: string;
  attribute_values: AttributeValuePayload[];
}
