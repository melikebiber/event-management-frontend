import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}
interface SignupRequest {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
}

interface LoginUser {
  user_id?: number;
  id?: number;
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  role?: string;
}

interface LoginResponse {
  success?: boolean;
  token?: string;
  message?: string;
  user?: LoginUser;
}
interface SignupResponse {
  success?: boolean;
  message?: string;
  user?: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
 private apiUrl = 'https://event-management-backend-bay.vercel.app';

  constructor(private http: HttpClient) {}

  login(loginData: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`,
      loginData
    );
  }
  signup(signupData: SignupRequest): Observable<SignupResponse> {
  return this.http.post<SignupResponse>(
    `${this.apiUrl}/signup`,
    signupData
  );
}

  isLoggedIn(): boolean {
    return localStorage.getItem('token') !== null;
  }
isAdmin(): boolean {
  const currentUserText =
    localStorage.getItem('currentUser');

  if (!currentUserText) {
    return false;
  }

  try {
    const currentUser = JSON.parse(
      currentUserText
    ) as {
      role?: string;
    };

    return currentUser.role === 'ADMIN';
  } catch {
    return false;
  }
}
  logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
}
}