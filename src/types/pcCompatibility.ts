export type CompatibilityOperator = 'EXACT' | 'LTE' | 'GTE';

export interface AttributeRef {
  id: string;
  name: string;
  slug?: string;
  data_type?: string;
  unit?: string;
  status?: string;
}

export interface CategoryRef {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  status?: string;
}

export interface CompatibilityCondition {
  id?: string;
  base_attribute_id?: string;
  target_attribute_id?: string;
  base_attribute?: AttributeRef;
  target_attribute?: AttributeRef;
  operator: CompatibilityOperator;
}

export interface CompatibilityRule {
  id: string;
  base_category_id?: string;
  target_category_id?: string;
  base_category: CategoryRef;
  target_category: CategoryRef;
  conditions: CompatibilityCondition[];
  created_at?: string;
  created_by?: string;
  updated_at?: string | null;
  updated_by?: string | null;
}

export interface ConditionPayload {
  base_attribute_id: string;
  target_attribute_id: string;
  operator: CompatibilityOperator;
}

export interface CompatibilityRuleForm {
  base_category_id: string;
  target_category_id: string;
  conditions: ConditionPayload[];
}
