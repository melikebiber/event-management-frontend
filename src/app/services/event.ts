import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventResponse } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private apiUrl =
    'https://event-management-backend-bay.vercel.app/events';

  constructor(
    private http: HttpClient
  ) {}

  // Tüm etkinlikleri getirir
  getAllEvents(): Observable<EventResponse> {
    return this.http.get<EventResponse>(
      this.apiUrl
    );
  }

  // ID'ye göre tek bir etkinliği getirir
  getEventById(
    id: number | string
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${id}`
    );
  }

  // ID'ye göre etkinliği siler
  deleteEvent(
    id: number
  ): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );
  }

  // Yeni etkinlik oluşturur
  createEvent(
    eventData: {
      title: string;
      description: string;
      event_date: string;
      start_time: string;
      end_time: string;
      capacity: number;
      status: string;
      organizer_id: number;
      category_id: number;
      location_id: number;
    }
  ): Observable<any> {
    return this.http.post<any>(
      this.apiUrl,
      eventData
    );
  }

  // Etkinliği günceller
  updateEvent(
    eventId: number,
    eventData: {
      title: string;
      description: string;
      event_date: string;
      start_time: string;
      end_time: string;
      capacity: number;
      status: string;
      organizer_id: number;
      category_id: number;
      location_id: number;
    }
  ): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/${eventId}`,
      eventData
    );
  }

  // Etkinlik değerlendirmesi gönderir
  createRating(
    eventId: number,
    ratingData: {
      content_score: number;
      organization_score: number;
      location_score: number;
      satisfaction_score: number;
      comment?: string;
    }
  ): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/${eventId}/ratings`,
      ratingData,
      {
        headers: this.getAuthHeaders()
      }
    );
  }

  // Etkinliğin genel puanını getirir
  getRatingSummary(
    eventId: number
  ): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/${eventId}/rating-summary`
    );
  }

  // Token bilgisini istek başlığına ekler
  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      '';

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}