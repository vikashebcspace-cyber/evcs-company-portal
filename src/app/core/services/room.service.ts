import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Room } from '../models';

@Injectable({ providedIn: 'root' })
export class RoomService {
  private url = `${environment.apiUrl}/rooms/company`;

  constructor(private http: HttpClient) {}

  // Returns all active rooms in the company's assigned building
  getAll() {
    return this.http.get<Room[]>(`${this.url}/`);
  }
}
