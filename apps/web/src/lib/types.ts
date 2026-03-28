export type ClinicStatus = "active" | "trial" | "churned" | "onboarding";
export type SubscriptionPlan = "individual" | "bundle" | "fullstack";
export type ProductId =
  | "ai-triage"
  | "online-consultation"
  | "remote-monitoring"
  | "patient-app"
  | "partner-network"
  | "emr"
  | "receipt-computer";

export interface Product {
  id: ProductId;
  name: string;
  nameEn: string;
  description: string;
  monthlyPrice: number;
  icon: string;
  category: "external" | "fullstack-only";
  features: string[];
  color: string;
}

export interface Clinic {
  id: string;
  name: string;
  type: "partner" | "owned";
  status: ClinicStatus;
  plan: SubscriptionPlan;
  subscribedProducts: ProductId[];
  address: string;
  doctorName: string;
  specialty: string;
  monthlyPatients: number;
  onlineRatio: number;
  joinedAt: string;
  mrr: number;
  contactEmail: string;
  contactPhone: string;
}

export interface SubscriptionMatrix {
  clinicId: string;
  products: Record<ProductId, boolean>;
}

export interface KpiData {
  month: string;
  partnerClinics: number;
  ownedClinics: number;
  totalPatients: number;
  onlinePatients: number;
  mrr: number;
  churnRate: number;
  continuationRate: number;
}

export interface RevenueBreakdown {
  source: string;
  amount: number;
  color: string;
}

export interface AlertItem {
  id: string;
  type: "warning" | "info" | "success" | "error";
  title: string;
  message: string;
  clinicId?: string;
  timestamp: string;
}

export interface ModuleStats {
  productId: ProductId;
  activeClinics: number;
  totalSessions: number;
  avgSessionTime: number;
  satisfaction: number;
  trend: number;
}
