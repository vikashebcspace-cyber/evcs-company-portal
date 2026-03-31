export interface Room {
  id: number;
  building: number;
  building_name: string;
  name: string;
  floor: string;
  capacity: number;
  open_time: string;
  close_time: string;
  min_duration_mins: number;
  max_duration_mins: number;
  amenities: string[];
  is_active: boolean;
}

export interface Booking {
  id: number;
  room: number;
  room_name: string;
  floor: string;
  company: number;
  company_name: string;
  booked_by_name: string;
  booked_by_email: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_mins: number;
  purpose: string;
  status: 'confirmed' | 'cancelled';
  created_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  role: string;
  company_id: number;
  company_name: string;
  building_id: number;
  building_name: string;
}

export interface TokenPayload {
  role: string;
  company_id: number;
  company_name: string;
  building_id: number;
  building_name: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  isBooked: boolean;
  booking?: Booking;
  isOwnBooking?: boolean;
}
