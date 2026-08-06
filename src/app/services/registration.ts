import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Registration {
  registration_id: number;
  user_id: number;
  event_id: number;
  ticket_id: number;
  status: string;
  registration_date?: string;

  event?: {
    event_id: number;
    title: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    status: string;

    category?: {
      category_name: string;
    };

    location?: {
      location_name: string;
      city: string;
      district: string;
    };
  };

  ticket?: {
    ticket_id: number;
    ticket_type: string;
  };
}

interface RegistrationRequest {
  user_id: number;
  event_id: number;
  ticket_id: number;
}

interface RegistrationResponse {
  success: boolean;
  message?: string;
  data?: Registration;
  remaining_ticket_quantity?: number;
}

interface UserRegistrationsResponse {
  success: boolean;
  message?: string;
  data: Registration[];
}

interface CancelRegistrationResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  // registration.ts
private apiUrl =
  'https://event-management-backend-bay.vercel.app/registrations';

  constructor(private http: HttpClient) {}

  createRegistration(
    registrationData: RegistrationRequest
  ): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      this.apiUrl,
      registrationData
    );
  }

  getUserRegistrations(
    userId: number
  ): Observable<UserRegistrationsResponse> {
    return this.http.get<UserRegistrationsResponse>(
      `${this.apiUrl}/user/${userId}`
    );
  }
  getUserCancelledRegistrations(
  userId: number
): Observable<UserRegistrationsResponse> {
  return this.http.get<UserRegistrationsResponse>(
    `${this.apiUrl}/user/${userId}/cancelled`
  );
}

  cancelRegistration(
    registrationId: number
  ): Observable<CancelRegistrationResponse> {
    return this.http.delete<CancelRegistrationResponse>(
      `${this.apiUrl}/${registrationId}`
    );
  }
}