
export type UserRole = 'shipper' | 'carrier' | 'admin';

export enum BookingStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  ARRIVED_AT_PICKUP = 'Arrived at Pickup',
  LOADED = 'Loaded & Secure',
  IN_TRANSIT = 'In Transit',
  ARRIVED_AT_DELIVERY = 'Arrived at Delivery',
  DELIVERED = 'Delivered',
  COMPLETED = 'Completed',
  DISPUTED = 'Disputed'
}

export type CargoType = 'Palletised' | 'Loose' | 'Refrigerated' | 'Hazardous' | 'Abnormal' | 'Container';

export type DocumentType = 'Company Registration' | 'COF' | 'GIT Insurance' | 'Driver PrDP' | 'Vehicle License';

export interface CarrierDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  rejectionReason?: string;
  url?: string;
}

export interface Vehicle {
  id: string;
  type: string;
  regNumber: string;
  capacityTons: number;
  capacityPallets: number;
  maxFloorSpace?: number; // In LDM
  hasTailLift: boolean;
  isHazmatCertified: boolean;
  isRefrigerated: boolean;
  isAvailable: boolean;
  photos?: string[];
}

export interface Listing {
  id: string;
  carrierId: string;
  carrierName: string;
  origin: string;
  destination: string;
  stopovers?: string[];
  date: string;
  vehicleType: string;
  cargoType?: CargoType;
  serviceType: 'Door-to-Door' | 'Depot-to-Depot';
  availableTons: number;
  availablePallets: number;
  availableDetails?: string;
  baseRate: number;
  price: number;
  isBooked: boolean;
  driverAssistance: boolean;
}

export interface Booking {
  id: string;
  listingId: string;
  shipperId: string;
  shipperName?: string;
  carrierId: string;
  carrierName?: string;
  status: BookingStatus;
  origin: string;
  destination: string;
  pickupDate: string;
  price: number;
  podUrl?: string;
  pickupPhotoUrl?: string;
  escrowStatus: 'Pending' | 'Secured' | 'Released';
  deliveryNotes?: string;
  waybillId: string;
}

export interface PlatformSettings {
  globalMarkupPercent: number;
  autoReleaseHours: number;
  isJobPostingEnabled: boolean;
  isRegistrationOpen: boolean;
  otpRequiredOnDelivery: boolean;
}

export interface Transaction {
  id: string;
  type: 'Escrow' | 'Payout' | 'Refund';
  amount: number;
  status: 'Pending' | 'Completed' | 'Failed';
  timestamp: string;
  referenceId: string;
  entityName: string;
}

export interface AuditLogEntry {
  id: string;
  adminName: string;
  action: string;
  targetType: 'Carrier' | 'Shipper' | 'Booking' | 'Settings';
  targetId: string;
  timestamp: string;
}

export interface CarrierProfile {
  id: string;
  companyName: string;
  regNumber: string;
  vatNumber?: string;
  address: string;
  verified: boolean;
  rating: number;
  vehicles: Vehicle[];
  documents?: CarrierDocument[];
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    branchCode: string;
    accountType: string;
  };
}

export interface ShipperProfile {
  id: string;
  companyName: string;
  activeBookings: number;
  totalSpend: number;
  rating: number;
  disputeRate: number;
  status: 'Active' | 'Suspended';
}

export interface DisputeEvidence {
  id: string;
  uploadedBy: 'shipper' | 'carrier' | 'admin';
  uploaderName: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'document';
  uploadedAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  reason: string;
  status: 'Open' | 'In Review' | 'Resolved';
  createdAt: string;
  evidence: DisputeEvidence[];
}
