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

interface UserProfileResponse {
  success: boolean;
  message?: string;
  data: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

 // user.ts
private apiUrl =
  'https://event-management-backend-bay.vercel.app/users';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<UserProfileResponse> {
    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    return this.http.get<UserProfileResponse>(
      this.apiUrl,
      { headers }
    );
  }
}