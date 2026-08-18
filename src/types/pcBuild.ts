import { PcComponent } from './pcComponent';

export interface PcBuildCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  contact_number: string;
  profile_image: string | null;
  addresses: any[];
}

export interface PcBuildItem {
  id: string;
  component_details: PcComponent;
  quantity: number;
  build: string;
  component: string;
  created_at?: string;
}

export interface PcBuild {
  id: string;
  build_name: string;
  status: string;
  is_locked: boolean;
  cached_total_price: string;
  customer: number;
  customer_details: PcBuildCustomer;
  items: PcBuildItem[];
  created_at: string;
}
