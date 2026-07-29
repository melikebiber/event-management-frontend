import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
  location_id: number;
  location_name: string;
  address?: string;
  city: string;
  district: string;
  capacity?: number;
}

interface LocationResponse {
  success: boolean;
  data: Location[];
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

// location.ts
private apiUrl =
  'https://event-management-backend-bay.vercel.app/locations';

  constructor(
    private http: HttpClient
  ) {}

  // Tüm konumları getirir
  getAllLocations(): Observable<LocationResponse> {
    return this.http.get<LocationResponse>(
      this.apiUrl
    );
  }
  createLocation(
  locationData: {
    location_name: string;
    address: string;
    city: string;
    district: string;
    capacity: number;
  }
): Observable<any> {
  return this.http.post<any>(
    this.apiUrl,
    locationData
  );
}
}
