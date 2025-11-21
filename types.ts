

export type UserRole = 'shipper' | 'carrier' | 'admin';

export enum BookingStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  COLLECTED = 'Collected', // Represents "Loaded"
  IN_TRANSIT = 'In Transit',
  AT_HUB = 'At Hub',
  DELIVERED = 'Delivered',
  COMPLETED = 'Completed',
  DISPUTED = 'Disputed'
}

export type DocumentType = 
  | 'Company Registration' 
  | 'COF' 
  | 'GIT Insurance' 
  | 'Driver PrDP' 
  | 'ID Document' 
  | 'VAT Registration' 
  | 'Payment Rep ID';

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
  photos?: string[];
  providesLoadingAssist: boolean; // New field for loading/offloading help
}

export interface CarrierPerformance {
  totalJobs: number;
  onTimeRate: number; // Percentage 0-100
  avgPodUploadTime: number; // Hours
  cancellationRate: number; // Percentage
}

export interface CarrierProfile {
  id: string;
  companyName: string;
  verified: boolean;
  rating: number;
  vehicles: Vehicle[];
  documents?: CarrierDocument[];
  performance?: CarrierPerformance;
  riskScore?: 'Low' | 'Medium' | 'High';
}

export interface ShipperProfile {
  id: string;
  entityType: 'Individual' | 'Company';
  name: string; // Company Name or Individual Name
  verified: boolean;
  documents: CarrierDocument[];
  rating?: number;
}

export interface RiskAlert {
  id: string;
  severity: 'High' | 'Medium' | 'Low';
  category: 'Fraud' | 'Compliance' | 'Service';
  message: string;
  entityId: string;
  entityName: string;
  timestamp: string;
  status: 'New' | 'Investigating' | 'Resolved';
}

export interface Listing {
  id: string;
  carrierId: string;
  carrierName: string;
  origin: string;
  destination: string;
  date: string; // ISO date string
  collectionWindow?: string; // e.g. "08:00 - 12:00"
  deliveryWindow?: string;   // e.g. "14:00 - 16:00"
  transitTime?: string; // e.g. "Overnight", "2-3 Days"
  vehicleType: string;
  serviceCategory: string; // Added service category (Overnight, Economy, etc.)
  serviceType: 'Door-to-Door' | 'Depot-to-Depot';
  availableTons: number;
  availablePallets: number;
  availableDetails?: string; // Free text for space available
  includesLoadingAssist: boolean; // New field for listing specific assistance
  gitCover: boolean; // Indicates if GIT insurance is included
  gitLimit?: number; // The limit of the GIT cover in ZAR
  baseRate: number;
  price: number; // Includes markup
  isBooked: boolean;
}

export interface Review {
  rating: number; // 1-5 Stars
  comment: string;
  createdAt: string;
  criteria: {
    [key: string]: number; // e.g. "Punctuality": 5, "Dock Access": 3
  };
}

export interface Booking {
  id: string;
  listingId: string;
  shipperId: string;
  carrierId: string;
  status: BookingStatus;
  paymentStatus: 'Escrow' | 'Released' | 'Hold' | 'Refunded'; // Added for payment safety
  origin: string;
  destination: string;
  pickupDate: string;
  baseRate?: number; // Carrier earnings
  price: number; // Shipper cost (includes markup)
  podUrl?: string;
  signatureUrl?: string; // Digital signature
  waybillNumber?: string; // Auto-generated waybill
  
  // Risk Mitigation & Security
  collectedAt?: string; // Timestamp when loaded
  collectionLocation?: { lat: number, lng: number }; // Geo-tag at pickup
  deliveredAt?: string; // Timestamp when delivered
  deliveryLocation?: { lat: number, lng: number }; // Geo-tag at delivery
  loadingPhotoUrl?: string; // Proof of load
  deliveryPhotoUrl?: string; // Proof of off-load/condition at delivery
  truckSealed?: boolean; // Security question answer
  sealNumber?: string; // Optional seal ID
  deliveryOtp?: string; // 6-digit PIN for delivery verification

  // Contact Details (Hidden until booking)
  shipperName?: string;
  shipperPhone?: string;
  shipperEmail?: string;
  carrierName?: string;
  carrierPhone?: string;
  carrierEmail?: string;
  contactRevealed?: boolean; // To track if contact was shown

  // Two-way Ratings
  shipperReview?: Review; // The review LEFT BY the Shipper FOR the Carrier
  carrierReview?: Review; // The review LEFT BY the Carrier FOR the Shipper
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
  status: 'Open' | 'Resolved';
  createdAt: string;
  evidence: DisputeEvidence[];
}

export interface QuoteRequest {
  id: string;
  shipperId: string;
  shipperName: string; // Mock name
  origin: string;
  destination: string;
  vehicleType: string;
  serviceCategory: string; // Added service category
  serviceType: 'Door-to-Door' | 'Depot-to-Depot';
  cargoType: string;
  weight: number;
  date: string;
  status: 'Open' | 'Booked' | 'Closed';
  createdAt: string;
  dimensions?: {
      length: number;
      width: number;
      height: number;
  };
}

export interface QuoteOffer {
  id: string;
  requestId: string;
  carrierId: string;
  carrierName: string;
  amount: number; // Carrier earning
  transitTime?: string; // Carrier's promised transit time (SLA)
  message?: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  createdAt: string;
}