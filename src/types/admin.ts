// Shapes of the /api/admin/* JSON responses used by the admin console (dates arrive as ISO strings).
import type { ListingRecord, RequirementRecord } from "@/types/records";

export interface AdminContact {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  companyName: string | null;
}

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalRequirements: number;
  newInquiries: number;
  totalInquiries: number;
  pendingApprovals: number;
  pendingListings: number;
  pendingRequirements: number;
}

export interface AdminInquiry {
  id: string;
  inquirerId: string;
  listingId: string | null;
  requirementId: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  inquirer: AdminContact;
  // readonly lets TypeScript narrow through `const hasListing = inq.listing != null`
  readonly listing: {
    id: string;
    title: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    seller: AdminContact;
  } | null;
  readonly requirement: {
    id: string;
    title: string;
    category: string;
    buyer: AdminContact;
  } | null;
}

export interface AdminUser extends AdminContact {
  role: string;
  createdAt: string;
  _count: { listings: number; requirements: number; inquiries: number };
}

export interface AdminListing extends ListingRecord {
  seller: AdminContact;
  _count: { inquiries: number };
}

export interface AdminRequirement extends RequirementRecord {
  buyer: AdminContact;
  _count: { inquiries: number };
}
