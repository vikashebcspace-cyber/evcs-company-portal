import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Booking } from '../models';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private url = `${environment.apiUrl}/bookings/company`;

  constructor(private http: HttpClient) {}

  // All confirmed bookings for the company's building (for calendar view)
  getAll(filters: { date?: string; room?: number } = {}) {
    let params = new HttpParams();
    if (filters.date) params = params.set('date', filters.date);
    if (filters.room) params = params.set('room', filters.room);
    return this.http.get<Booking[]>(`${this.url}/`, { params });
  }

  create(data: {
    room: number;
    booked_by_name: string;
    booked_by_email: string;
    date: string;
    start_time: string;
    end_time: string;
    purpose?: string;
  }) {
    return this.http.post<Booking>(`${this.url}/`, data);
  }

  cancel(id: number) {
    return this.http.post(`${this.url}/${id}/cancel/`, {});
  }
}
