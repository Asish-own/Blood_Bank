# Database Schema Documentation

This document describes the Firestore database schema for the LifeLink Emergency Healthcare and Blood Management System.

## Collections

### 1. `users`
User profiles with authentication and role information.

```typescript
{
  uid: string;                    // Firebase Auth UID
  email: string;
  name: string;
  role: 'donor' | 'patient' | 'ambulance' | 'hospital' | 'doctor';
  bloodGroup?: string;            // For donors/patients
  phone?: string;
  location?: {
    lat: number;
    lng: number;
  };
  rewardPoints?: number;
  createdAt: Timestamp;
}
```

### 2. `donors`
Blood donor registrations (public registration).

```typescript
{
  name: string;
  age: number;                    // 18-65
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;                  // 10-digit mobile number
  address: string;
  donationHistory?: string;       // Optional notes
  status: 'active' | 'inactive';
  createdAt: Timestamp;
}
```

### 3. `blood_requests`
Blood receiver/patient requests for blood transfusion.

```typescript
{
  patientName: string;
  hospitalName: string;
  requiredBloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  urgencyLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  phoneNumber: string;            // 10-digit mobile number
  status: 'pending' | 'fulfilled' | 'cancelled';
  createdAt: Timestamp;
}
```

### 4. `ambulances`
Ambulance driver and vehicle registrations.

```typescript
{
  driverName: string;
  ambulanceNumber: string;        // Vehicle registration number
  serviceArea: string;            // Geographic service area
  phone: string;                  // 10-digit mobile number
  availability: boolean;
  status: 'active' | 'inactive';
  location?: {
    lat: number;
    lng: number;
  };
  createdAt: Timestamp;
}
```

### 5. `hospitals`
Hospital registrations with blood stock management.

```typescript
{
  name: string;
  address: string;
  emergencyContact: string;       // 10-digit mobile number
  bloodStock: {
    'A+': number;
    'A-': number;
    'B+': number;
    'B-': number;
    'AB+': number;
    'AB-': number;
    'O+': number;
    'O-': number;
  };
  status: 'active' | 'inactive';
  createdAt: Timestamp;
}
```

### 6. `SOS_cases`
Emergency cases requiring ambulance and medical attention.

```typescript
{
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  ambulanceId?: string;
  hospitalId?: string;
  ambulanceLocation?: {
    lat: number;
    lng: number;
  };
  hospitalLocation?: {
    lat: number;
    lng: number;
  };
  bloodGroup?: string;
  status: 'pending' | 'assigned' | 'en_route' | 'arrived' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 7. `donations`
Blood donation records.

```typescript
{
  donorId: string;
  hospitalId: string;
  date: Timestamp;
  bloodGroup: string;
  quantity: number;               // in units
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Timestamp;
}
```

### 8. `appointments`
Doctor appointments.

```typescript
{
  doctorId: string;
  patientId: string;
  date: Timestamp;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Timestamp;
}
```

### 9. `appointment_slots`
Available appointment time slots.

```typescript
{
  doctorId: string;
  date: Timestamp;
  startTime: string;
  endTime: string;
  available: boolean;
  createdAt: Timestamp;
}
```

## Firestore Security Rules

See `firestore.rules` for complete security rules. Key points:

- **Users**: Read/write access only for authenticated users and their own data
- **Donors**: Public registration (create), authenticated read/update
- **Blood Requests**: Public registration (create), authenticated read/update
- **Ambulances**: Authenticated read/write with role-based access
- **Hospitals**: Authenticated read/write with role-based access
- **SOS Cases**: Authenticated create, role-based update access
- **Donations**: Authenticated read, create/update with ownership checks

## Indexes

Firestore indexes are configured in `firestore.indexes.json`:

1. `SOS_cases` - Queries by `ambulanceId` + `status`
2. `SOS_cases` - Queries by `hospitalId` + `status`
3. `donations` - Queries by `donorId` + `date`
4. `appointments` - Queries by `doctorId` + `date`

## API Endpoints

### Registration Endpoints

- `POST /api/register/donor` - Register blood donor
- `POST /api/register/receiver` - Register blood receiver request
- `POST /api/register/ambulance` - Register ambulance driver
- `POST /api/register/hospital` - Register hospital

All endpoints validate input and return:
- `200 OK` with `{ success: true, id: string, message: string }` on success
- `400 Bad Request` with `{ error: string }` for validation errors
- `500 Internal Server Error` with `{ error: string }` for server errors
