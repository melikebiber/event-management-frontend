import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Ticket {
  ticket_id: number;
  event_id: number;
  ticket_type: string;
  total_quantity: number;
  available_quantity: number;
}

interface TicketListResponse {
  success: boolean;
  data: Ticket[];
  message?: string;
}

interface TicketResponse {
  success: boolean;
  data: Ticket;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {

  
  // ticket.ts
private apiUrl =
  'https://event-management-backend-bay.vercel.app/tickets';

  constructor(
    private http: HttpClient
  ) {}

  // Etkinliğe ait biletleri getirir
  getTicketsByEventId(
    eventId: number | string
  ): Observable<TicketListResponse> {
    return this.http.get<TicketListResponse>(
      `${this.apiUrl}/event/${eventId}`
    );
  }

  // Yeni bilet türü oluşturur
  createTicket(
    ticketData: {
      event_id: number;
      ticket_type: string;
      total_quantity: number;
      available_quantity: number;
    }
  ): Observable<TicketResponse> {
    return this.http.post<TicketResponse>(
      this.apiUrl,
      ticketData
    );
  }

  // Mevcut bileti günceller
  updateTicket(
    ticketId: number,
    ticketData: {
      ticket_type: string;
      total_quantity: number;
      available_quantity: number;
    }
  ): Observable<TicketResponse> {
    return this.http.put<TicketResponse>(
      `${this.apiUrl}/${ticketId}`,
      ticketData
    );
  }

  // Bileti siler
  deleteTicket(
    ticketId: number
  ): Observable<{
    success: boolean;
    message?: string;
  }> {
    return this.http.delete<{
      success: boolean;
      message?: string;
    }>(
      `${this.apiUrl}/${ticketId}`
    );
  }
}