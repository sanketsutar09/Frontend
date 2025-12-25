import { Injectable, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// models/user.model.ts
export interface User {
  createdAt: any;
  password: any;
  _id: string;
  name: string;
  email: string;
  // add other fields your API returns
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/user';
  private userEmailSource = new BehaviorSubject<string | null>(null);
  userEmail$ = this.userEmailSource.asObservable();
  isLoggedIn$ = this.userEmail$.pipe(map(email => !!email));
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone // ✅ Added
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      const storedEmail = sessionStorage.getItem('userEmail');
      if (storedEmail) {
        this.zone.run(() => { // ✅ ensures emission is in Angular zone
          this.userEmailSource.next(storedEmail);
        });
      }
    }
  }

  getStoredUserEmail(): string | null {
    return this.isBrowser ? sessionStorage.getItem('userEmail') : null;
  }

  setUserEmail(email: string) {
    if (this.isBrowser) {
      sessionStorage.setItem('userEmail', email);
    }
    this.zone.run(() => { 
      this.userEmailSource.next(email);
    });
  }

  clearUserEmail() {
    if (this.isBrowser) {
      sessionStorage.removeItem('userEmail');
    }
    this.zone.run(() => {  
      this.userEmailSource.next(null);
    });
  }

  registerUser(data: any) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  loginUser(data: any) {
    return this.http.post(`${this.baseUrl}/login`, data);
  }

  getUserProfile(email?: string) {
    return this.http.get<User>(`${this.baseUrl}/user/${email}`);
  }

  updateUserProfile(id: string, formData: FormData) {
    return this.http.put(`${this.baseUrl}/update/${id}`, formData);
  }

  incrementLoginCount(email: string) {
    return this.http.put(`${this.baseUrl}/increment-login/${email}`, {});
  }

  getUserBookings(email: string) {
  return this.http.get(
    `http://localhost:3000/api/booking/user/${encodeURIComponent(email)}`
  );
}

cancelUserbooking(bookingId: string): Observable<any>{
  return this.http.delete(`http://localhost:3000/api/booking/${bookingId}`)
}

private apiUrl = 'http://localhost:3000/api/contact';

 sendContactForm(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  sendFeedback(data: any){
    return this.http.post('http://localhost:3000/api/feedback', data)
  }

  getBookingsForMyProperties(email: string) {
  return this.http.get<any[]>(`http://localhost:3000/api/booking/owner/${email}`);
}



}
