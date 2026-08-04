import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  user_id: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  role: string;
  created_at?: string;
}

export interface UpdateProfileRequest {
  name: string;
  surname: string;
  email: string;
  phone: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UserProfileResponse {
  success: boolean;
  message?: string;
  data: UserProfile;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: UserProfile;
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl =
    'https://event-management-backend-bay.vercel.app/users';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(
      this.apiUrl,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  updateProfile(
    data: UpdateProfileRequest
  ): Observable<UpdateProfileResponse> {
    return this.http.put<UpdateProfileResponse>(
      `${this.apiUrl}/profile`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  changePassword(
    data: ChangePasswordRequest
  ): Observable<ChangePasswordResponse> {
    return this.http.put<ChangePasswordResponse>(
      `${this.apiUrl}/change-password`,
      data,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}