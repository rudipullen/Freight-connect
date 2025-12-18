
import { Booking, BookingStatus, CarrierProfile, Listing, Dispute, AuditLogEntry, ShipperProfile } from "./types";

export const SA_CITIES = [
  "Johannesburg", "Pretoria", "Cape Town", "Durban", "Port Elizabeth", 
  "Bloemfontein", "East London", "Nelspruit", "Polokwane", "Kimberley", 
  "Rustenburg", "George", "Upington", "Pietermaritzburg", "Soweto", 
  "Benoni", "Tembisa", "Vereeniging", "Centurion", "Sandton", "Midrand",
  "Richards Bay", "Mahikeng", "Mthatha", "Welkom", "Newcastle", 
  "Krugersdorp", "Witbank", "Potchefstroom", "Paarl", "Worcester"
];

export const MOCK_SHIPPERS: ShipperProfile[] = [
  { id: 's1', companyName: 'Acme Supplies Ltd', activeBookings: 3, totalSpend: 145000, rating: 4.9, disputeRate: 2, status: 'Active' },
  { id: 's2', companyName: 'Global Retailers', activeBookings: 0, totalSpend: 28000, rating: 3.5, disputeRate: 15, status: 'Active' },
  { id: 's3', companyName: 'Heavy Parts Co', activeBookings: 8, totalSpend: 560000, rating: 4.7, disputeRate: 5, status: 'Active' }
];

export const MOCK_CARRIERS: CarrierProfile[] = [
  {
    id: 'c1',
    companyName: 'Swift Logistics',
    regNumber: '2010/123456/07',
    address: '123 Logistics Way, Johannesburg, 2000',
    verified: true,
    rating: 4.8,
    vehicles: [
      { id: 'v1', type: 'Refrigerated', regNumber: 'ABC-123', capacityTons: 20, capacityPallets: 24, hasTailLift: true, isHazmatCertified: false, isRefrigerated: true, isAvailable: true },
      { id: 'v2', type: 'Flatbed', regNumber: 'XYZ-789', capacityTons: 30, capacityPallets: 0, hasTailLift: false, isHazmatCertified: false, isRefrigerated: false, isAvailable: true }
    ]
  },
  {
    id: 'c2',
    companyName: 'HaulRight Trans',
    regNumber: '2015/987654/07',
    address: '45 Haulage St, Cape Town, 8000',
    verified: false,
    rating: 4.2,
    vehicles: [
      { id: 'v3', type: 'Box Truck', regNumber: 'HUL-555', capacityTons: 8, capacityPallets: 10, hasTailLift: true, isHazmatCertified: false, isRefrigerated: false, isAvailable: true }
    ]
  }
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    carrierId: 'c1',
    carrierName: 'Swift Logistics',
    origin: 'Johannesburg',
    destination: 'Cape Town',
    date: '2024-06-15',
    vehicleType: 'Refrigerated',
    serviceType: 'Door-to-Door',
    availableTons: 15,
    availablePallets: 20,
    baseRate: 12000,
    price: 13800,
    isBooked: false,
    driverAssistance: false,
  },
  {
    id: 'l2',
    carrierId: 'c1',
    carrierName: 'Swift Logistics',
    origin: 'Durban',
    destination: 'Pretoria',
    date: '2024-06-18',
    vehicleType: 'Flatbed',
    serviceType: 'Depot-to-Depot',
    availableTons: 28,
    availablePallets: 0,
    baseRate: 8500,
    price: 9775,
    isBooked: false,
    driverAssistance: false,
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    listingId: 'l10',
    shipperId: 's1',
    shipperName: 'Acme Supplies Ltd',
    carrierId: 'c1',
    carrierName: 'Swift Logistics',
    status: BookingStatus.IN_TRANSIT,
    origin: 'Cape Town',
    destination: 'Johannesburg',
    pickupDate: '2024-06-01',
    price: 14000,
    pickupPhotoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=400',
    escrowStatus: 'Secured',
    waybillId: 'WB-B1'
  },
  {
    id: 'b2',
    listingId: 'l11',
    shipperId: 's1',
    shipperName: 'Acme Supplies Ltd',
    carrierId: 'c1',
    carrierName: 'Swift Logistics',
    status: BookingStatus.DISPUTED,
    origin: 'Nelspruit',
    destination: 'Maputo',
    pickupDate: '2024-05-28',
    price: 8500,
    escrowStatus: 'Pending',
    waybillId: 'WB-B2'
  }
];

export const MOCK_DISPUTES: Dispute[] = [
  {
    id: 'd1',
    bookingId: 'b2',
    reason: 'Shipper claims 2 pallets arrived with water damage. Carrier denies responsibility, citing improper packaging.',
    status: 'Open',
    createdAt: '2024-06-01T10:23:00Z',
    evidence: [
      {
        id: 'e1',
        uploadedBy: 'shipper',
        uploaderName: 'Acme Supplies',
        fileName: 'damaged_goods_01.jpg',
        fileUrl: 'https://images.unsplash.com/photo-1594818379496-da1e345b0ded?auto=format&fit=crop&q=80&w=400',
        fileType: 'image',
        uploadedAt: '2024-06-01T10:30:00Z'
      }
    ]
  }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'a1', adminName: 'Sarah Admin', action: 'Approved Documents', targetType: 'Carrier', targetId: 'c1', timestamp: '2024-06-01T09:12:00Z' },
  { id: 'a2', adminName: 'System', action: 'Auto-Release Payout', targetType: 'Booking', targetId: 'b1', timestamp: '2024-06-01T10:00:00Z' },
  { id: 'a3', adminName: 'Sarah Admin', action: 'Modified Global Markup', targetType: 'Settings', targetId: 'global', timestamp: '2024-06-01T11:45:00Z' }
];
