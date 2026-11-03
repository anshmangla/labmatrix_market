// JSON shapes of database records as returned by the API routes (dates arrive as ISO strings).

export interface ListingRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  itemType: string;
  partNumber: string | null;
  compatibleWith: string | null;
  minPrice: number;
  maxPrice: number;
  condition: string | null;
  location: string | null;
  photos: string[];
  quantity: number;
  status: string;
  isApproved: boolean;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequirementRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  itemType: string;
  partNumber: string | null;
  compatibleWith: string | null;
  status: string;
  isApproved: boolean;
  buyerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

/** An inquiry with the listing or request it targets (GET /api/inquiries). */
export interface InquiryWithTarget {
  id: string;
  inquirerId: string;
  listingId: string | null;
  requirementId: string | null;
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  readonly listing: {
    id: string;
    title: string;
    itemType: string;
    minPrice: number;
    maxPrice: number;
  } | null;
  readonly requirement: {
    id: string;
    title: string;
    itemType: string;
  } | null;
}

/** GET /api/user/profile */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phoneNumber: string | null;
  companyName: string | null;
  role: string;
  createdAt: string;
  hasPassword: boolean;
}
