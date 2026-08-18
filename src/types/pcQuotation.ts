import { PcBuildCustomer, PcBuild } from './pcBuild';

export interface PcQuotation {
  id: string;
  quotation_number: string;
  build: string;
  build_name: string;
  customer_id: string;
  customer_details: PcBuildCustomer;
  build_details: PcBuild;
  subtotal: string;
  discount_percentage: string;
  discount: string;
  tax_percentage: string;
  tax: string;
  shipping_charge: string;
  grand_total: string;
  valid_until: string | null;
  notes: string | null;
  pdf_url: string;
  status: string;
  created_at: string;
  updated_at: string | null;
}
