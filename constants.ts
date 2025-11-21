


import { Booking, BookingStatus, CarrierProfile, Listing, Dispute, QuoteRequest, RiskAlert } from "./types";

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
      { id: 'v1', type: 'Refrigerated', regNumber: 'ABC-123', capacityTons: 20, capacityPallets: 24 },
      { id: 'v2', type: 'Flatbed', regNumber: 'XYZ-789', capacityTons: 30, capacityPallets: 0 }
    ],
    performance: {
      totalJobs: 142,
      onTimeRate: 98,
      avgPodUploadTime: 4.5, // hours
      cancellationRate: 1.2
    },
    riskScore: 'Low'
  },
  {
    id: 'c2',
    companyName: 'HaulRight Trans',
    verified: false,
    rating: 4.2,
    vehicles: [
      { id: 'v3', type: 'Box Truck', regNumber: 'HUL-555', capacityTons: 8, capacityPallets: 10 }
    ],
    performance: {
      totalJobs: 15,
      onTimeRate: 82,
      avgPodUploadTime: 48.5, // High gap alert
      cancellationRate: 5.0
    },
    riskScore: 'Medium'
  },
  {
    id: 'c3',
    companyName: 'FastTrack Logistics',
    verified: true,
    rating: 3.5,
    vehicles: [],
    performance: {
      totalJobs: 8,
      onTimeRate: 60,
      avgPodUploadTime: 72,
      cancellationRate: 0
    },
    riskScore: 'High'
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
  }
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    listingId: 'l10',
    shipperId: 's1',
    carrierId: 'c1',
    status: BookingStatus.IN_TRANSIT,
    paymentStatus: 'Escrow',
    origin: 'Cape Town',
    destination: 'Johannesburg',
    pickupDate: '2024-06-01',
    price: 14000,
    waybillNumber: 'WB-8374920',
    baseRate: 12500,
    shipperName: 'Acme Supplies',
    shipperPhone: '+27 82 555 0101',
    shipperEmail: 'logistics@acme.co.za',
    carrierName: 'Swift Logistics',
    carrierPhone: '+27 83 555 0202',
    carrierEmail: 'dispatch@swiftlogistics.co.za',
    contactRevealed: false,
    collectedAt: '2024-06-01T09:15:00',
    collectionLocation: { lat: -33.9249, lng: 18.4241 }, // Cape Town
    loadingPhotoUrl: 'https://images.unsplash.com/photo-1586191582116-d9014557e224?auto=format&fit=crop&q=80&w=300&h=200', // Mock Load Photo
    truckSealed: true,
    sealNumber: 'SL-998877',
    deliveryOtp: '839201'
  },
  {
    id: 'b2',
    listingId: 'l11',
    shipperId: 's1',
    carrierId: 'c1',
    status: BookingStatus.DISPUTED,
    paymentStatus: 'Hold',
    origin: 'Nelspruit',
    destination: 'Maputo',
    pickupDate: '2024-05-28',
    price: 8500,
    waybillNumber: 'WB-1192834',
    baseRate: 7500,
    shipperName: 'Acme Supplies',
    shipperPhone: '+27 82 555 0101',
    shipperEmail: 'logistics@acme.co.za',
    carrierName: 'Swift Logistics',
    carrierPhone: '+27 83 555 0202',
    carrierEmail: 'dispatch@swiftlogistics.co.za',
    contactRevealed: true,
    collectedAt: '2024-05-28T08:30:00',
    collectionLocation: { lat: -25.4753, lng: 30.9694 }, // Nelspruit
    loadingPhotoUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=300&h=200',
    
    deliveredAt: '2024-05-28T16:45:00',
    deliveryLocation: { lat: -25.9692, lng: 32.5732 }, // Maputo
    deliveryPhotoUrl: 'https://images.unsplash.com/photo-1566576912902-192ea976b608?auto=format&fit=crop&q=80&w=300&h=200', // Mock Delivery Photo
    
    truckSealed: false,
    deliveryOtp: '445566'
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

export const MOCK_QUOTE_REQUESTS: QuoteRequest[] = [
    {
        id: 'qr1',
        shipperId: 's1',
        shipperName: 'Acme Supplies',
        origin: 'Durban',
        destination: 'Johannesburg',
        vehicleType: 'Refrigerated',
        serviceType: 'Depot-to-Depot',
        cargoType: 'Frozen Fish',
        weight: 12,
        date: '2024-07-01',
        status: 'Open',
        createdAt: '2024-06-25'
    }
];

export const MOCK_RISK_ALERTS: RiskAlert[] = [
  {
    id: 'r1',
    severity: 'High',
    category: 'Fraud',
    message: 'Duplicate phone number detected for Carrier C3 and Carrier C9.',
    entityId: 'c3',
    entityName: 'FastTrack Logistics',
    timestamp: '2024-06-02T14:30:00Z',
    status: 'New'
  },
  {
    id: 'r2',
    severity: 'Medium',
    category: 'Service',
    message: 'POD Upload Gap > 48 hours for Booking #B2.',
    entityId: 'c2',
    entityName: 'HaulRight Trans',
    timestamp: '2024-06-01T09:00:00Z',
    status: 'Investigating'
  }
];
