import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { EventService } from '../../services/event';
import { Auth } from '../../services/auth';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  upcomingEvents: Event[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private authService: Auth,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getUpcomingEvents();
  }

  /**
   * Kullanıcının giriş yapıp yapmadığını kontrol eder.
   */
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  /**
   * Giriş yapan kullanıcının admin olup olmadığını kontrol eder.
   */
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getUpcomingEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.upcomingEvents = (response.data ?? [])
          .filter((event) => {
            const eventDate = new Date(
              event.event_date
            );

            return (
              event.status === 'active' &&
              eventDate >= today
            );
          })
          .sort((firstEvent, secondEvent) => {
            const firstDate = new Date(
              firstEvent.event_date
            ).getTime();

            const secondDate = new Date(
              secondEvent.event_date
            ).getTime();

            return firstDate - secondDate;
          })
          .slice(0, 4);

        this.isLoading = false;
        this.changeDetector.detectChanges();
      },

      error: (error: unknown) => {
        console.error(
          'Yaklaşan etkinlikler alınamadı:',
          error
        );

        this.upcomingEvents = [];

        this.errorMessage =
          'Yaklaşan etkinlikler şu anda gösterilemiyor.';

        this.isLoading = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  getEventImage(
    categoryName: string,
    eventTitle: string
  ): string {
    const category = categoryName
      .trim()
      .toLocaleLowerCase('tr-TR');

    const title = eventTitle
      .trim()
      .toLocaleLowerCase('tr-TR');

    if (
      title.includes('boncuk') ||
      title.includes('kolye')
    ) {
      return '/images/events/bead.jpg';
    }

    if (category.includes('seminer')) {
      return '/images/events/seminar.jpg';
    }

    if (category.includes('workshop')) {
      return '/images/events/workshop.jpg';
    }

    if (category.includes('konferans')) {
      return '/images/events/conference.jpg';
    }

    if (category.includes('konser')) {
      return '/images/events/concert.jpg';
    }

    if (category.includes('sergi')) {
      return '/images/events/exhibition.jpg';
    }

    if (
      category.includes('tiyatro') ||
      category.includes('kültür') ||
      category.includes('sanat')
    ) {
      return '/images/events/theatre.jpg';
    }

    return '/images/events/default.jpg';
  }
}