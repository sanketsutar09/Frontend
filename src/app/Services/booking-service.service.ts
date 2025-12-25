import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingServiceService {

  private baseUrl = 'http://localhost:3000/api/bookings';

  constructor(private http: HttpClient) {}

  createBooking(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }
  
  getOwnerBookings(ownerEmail: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/owner/${ownerEmail}`);
  }
}
