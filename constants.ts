
import { Booking, BookingStatus, CarrierProfile, Listing, Dispute } from "./types";

export const SA_CITIES = [
  "Johannesburg", "Pretoria", "Cape Town", "Durban", "Port Elizabeth", 
  "Bloemfontein", "East London", "Nelspruit", "Polokwane", "Kimberley", 
  "Rustenburg", "George", "Upington", "Pietermaritzburg", "Soweto", 
  "Benoni", "Tembisa", "Vereeniging", "Centurion", "Sandton", "Midrand",
  "Richards Bay", "Mahikeng", "Mthatha", "Welkom", "Newcastle", 
  "Krugersdorp", "Witbank", "Potchefstroom", "Paarl", "Worcester"
];

export const MOCK_CARRIERS: CarrierProfile[] = [
  {
    id: 'c1',
    companyName: 'Swift Logistics',
    verified: true,
    rating: 4.8,
    vehicles: [
      // Added missing properties: hasTailLift, isHazmatCertified, isRefrigerated, isAvailable
      { id: 'v1', type: 'Refrigerated', regNumber: 'ABC-123', capacityTons: 20, capacityPallets: 24, hasTailLift: true, isHazmatCertified: false, isRefrigerated: true, isAvailable: true },
      { id: 'v2', type: 'Flatbed', regNumber: 'XYZ-789', capacityTons: 30, capacityPallets: 0, hasTailLift: false, isHazmatCertified: false, isRefrigerated: false, isAvailable: true }
    ]
  },
  {
    id: 'c2',
    companyName: 'HaulRight Trans',
    verified: false,
    rating: 4.2,
    vehicles: [
      // Added missing properties: hasTailLift, isHazmatCertified, isRefrigerated, isAvailable
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
    price: 13800, // 15% markup
    isBooked: false,
    // Added missing property: driverAssistance
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
    // Added missing property: driverAssistance
    driverAssistance: false,
  },
  {
    id: 'l3',
    carrierId: 'c2',
    carrierName: 'HaulRight Trans',
    origin: 'Port Elizabeth',
    destination: 'Bloemfontein',
    date: '2024-06-20',
    vehicleType: 'Box Truck',
    serviceType: 'Door-to-Door',
    availableTons: 5,
    availablePallets: 6,
    baseRate: 4000,
    price: 4600,
    isBooked: false,
    // Added missing property: driverAssistance
    driverAssistance: true,
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    listingId: 'l10',
    shipperId: 's1',
    carrierId: 'c1',
    status: BookingStatus.IN_TRANSIT,
    origin: 'Cape Town',
    destination: 'Johannesburg',
    pickupDate: '2024-06-01',
    price: 14000,
    // Added missing properties: escrowStatus, waybillId
    escrowStatus: 'Secured',
    waybillId: 'WB-B1'
  },
  {
    id: 'b2',
    listingId: 'l11',
    shipperId: 's1',
    carrierId: 'c1',
    status: BookingStatus.DISPUTED,
    origin: 'Nelspruit',
    destination: 'Maputo',
    pickupDate: '2024-05-28',
    price: 8500,
    // Added missing properties: escrowStatus, waybillId
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
        fileUrl: '#',
        fileType: 'image',
        uploadedAt: '2024-06-01T10:30:00Z'
      }
    ]
  }
];