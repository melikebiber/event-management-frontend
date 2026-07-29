import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { EventService } from '../../services/event';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {

  events: Event[] = [];

  isLoading = true;
  errorMessage = '';

  deleteMessage = '';
  isDeleting = false;
  deletingEventId: number | null = null;

  constructor(
    private eventService: EventService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService
      .getAllEvents()
      .subscribe({
        next: (response) => {
          this.events = response.data ?? [];
          this.isLoading = false;

          this.changeDetector.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Admin etkinlikleri alınamadı:',
            error
          );

          this.events = [];
          this.isLoading = false;
          this.errorMessage =
            'Etkinlikler yüklenirken bir hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });
  }

  get totalEvents(): number {
    return this.events.length;
  }

  get activeEvents(): number {
    return this.events.filter(
      event => event.status === 'active'
    ).length;
  }

  get totalCapacity(): number {
    return this.events.reduce(
      (total, event) =>
        total + Number(event.capacity ?? 0),
      0
    );
  }
  deleteEvent(
  eventId: number,
  eventTitle: string
): void {
  const shouldDelete = window.confirm(
    `"${eventTitle}" etkinliğini silmek istediğine emin misin?`
  );

  if (!shouldDelete) {
    return;
  }

  this.isDeleting = true;
  this.deletingEventId = eventId;
  this.deleteMessage = '';

  this.eventService
    .deleteEvent(eventId)
    .subscribe({
      next: (response) => {
        this.events = this.events.filter(
          event =>
            event.event_id !== eventId
        );

        this.isDeleting = false;
        this.deletingEventId = null;

        this.deleteMessage =
          response.message ??
          'Etkinlik başarıyla silindi.';

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error(
          'Etkinlik silinemedi:',
          error
        );

        this.isDeleting = false;
        this.deletingEventId = null;

        this.deleteMessage =
          error.error?.message ??
          error.error?.error ??
          'Etkinlik silinirken bir hata oluştu.';

        this.changeDetector.detectChanges();
      }
    });
}
}