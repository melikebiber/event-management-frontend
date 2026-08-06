import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { EventService } from '../../services/event';

import {
  Ticket,
  TicketService
} from '../../services/ticket';

import {
  RegistrationService
} from '../../services/registration';

import { Event } from '../../models/event.model';

interface CurrentUser {
  id: number;
  username?: string;
  email?: string;
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail implements OnInit {

  event: Event | null = null;

  tickets: Ticket[] = [];
  selectedTicket: Ticket | null = null;

  isLoading = true;
  isRegistering = false;

  errorMessage = '';

  registrationMessage = '';
  registrationSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private ticketService: TicketService,
    private registrationService: RegistrationService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const eventId =
      this.route.snapshot.paramMap.get('id');

    if (!eventId) {
      this.errorMessage =
        'Etkinlik ID bilgisi bulunamadı.';

      this.isLoading = false;
      return;
    }

    this.getEventDetail(eventId);
    this.getEventTickets(eventId);
  }

  getEventDetail(eventId: string): void {
    this.eventService
      .getEventById(eventId)
      .subscribe({
        next: (response) => {
          this.event =
            response.data ?? response;

          this.isLoading = false;
          this.errorMessage = '';

          this.changeDetector.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Etkinlik detayı alınamadı:',
            error
          );

          this.event = null;

          this.errorMessage =
            'Etkinlik bilgileri alınamadı.';

          this.isLoading = false;

          this.changeDetector.detectChanges();
        }
      });
  }

  getEventTickets(eventId: string): void {
    this.ticketService
      .getTicketsByEventId(eventId)
      .subscribe({
        next: (response) => {
          this.tickets =
            response.data ?? [];

          this.selectedTicket =
            this.tickets.find(
              ticket =>
                ticket.available_quantity > 0
            ) ?? null;

          this.changeDetector.detectChanges();
        },

        error: (error: unknown) => {
          console.error(
            'Bilet bilgileri alınamadı:',
            error
          );

          this.tickets = [];
          this.selectedTicket = null;

          this.changeDetector.detectChanges();
        }
      });
  }

  registerForEvent(): void {
    this.registrationMessage = '';
    this.registrationSuccess = false;
      if (this.isPastEvent()) {
    return;
  }

  if (this.event?.status !== 'active') {
    return;
  }

    if (!this.event) {
      this.registrationMessage =
        'Etkinlik bilgisi bulunamadı.';

      return;
    }

    if (!this.selectedTicket) {
      this.registrationMessage =
        'Bu etkinlik için uygun bilet bulunamadı.';

      return;
    }

    if (
      this.selectedTicket.available_quantity <= 0
    ) {
      this.registrationMessage =
        'Bu etkinlikte boş kontenjan kalmadı.';

      return;
    }

    const currentUserText =
      localStorage.getItem('currentUser');

    if (!currentUserText) {
      this.registrationMessage =
        'Etkinliğe katılmak için giriş yapmalısın.';

      this.router.navigate(['/login']);
      return;
    }

    let currentUser: CurrentUser;

    try {
      currentUser = JSON.parse(
        currentUserText
      ) as CurrentUser;
    } catch {
      this.registrationMessage =
        'Kullanıcı bilgisi okunamadı. Yeniden giriş yap.';

      return;
    }

    if (!currentUser.id) {
      this.registrationMessage =
        'Kullanıcı ID bilgisi bulunamadı.';

      return;
    }

    this.isRegistering = true;

    const registrationData = {
      user_id:
        currentUser.id,

      event_id:
        this.event.event_id,

      ticket_id:
        this.selectedTicket.ticket_id
    };

    this.registrationService
      .createRegistration(
        registrationData
      )
      .subscribe({
        next: (response) => {
          this.isRegistering = false;
          this.registrationSuccess = true;

          this.registrationMessage =
            response.message ??
            'Etkinlik kaydı başarıyla oluşturuldu.';

          if (
            response.remaining_ticket_quantity !==
            undefined
          ) {
            this.selectedTicket!.available_quantity =
              response.remaining_ticket_quantity;
          }

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          this.isRegistering = false;
          this.registrationSuccess = false;

          this.registrationMessage =
            error.error?.message ??
            error.error?.error ??
            'Etkinlik kaydı oluşturulamadı.';

          console.error(
            'Etkinlik kayıt hatası:',
            error
          );

          this.changeDetector.detectChanges();
        }
      });
  }

  getEventImage(
    categoryName: string,
    eventTitle: string
  ): string {
    const category =
      categoryName
        ?.trim()
        .toLocaleLowerCase('tr-TR') ?? '';

    const title =
      eventTitle
        ?.trim()
        .toLocaleLowerCase('tr-TR') ?? '';

    if (
      title.includes('boncuk') ||
      title.includes('kolye')
    ) {
      return '/images/events/bead.jpg';
    }

    if (category.includes('seminer')) {
      return '/images/events/seminar.jpg';
    }

    if (
      category.includes('workshop') ||
      category.includes('atölye')
    ) {
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

    return '/images/events/conference.jpg';
  }
  isPastEvent(): boolean {
  if (!this.event?.event_date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(
    `${this.event.event_date}T00:00:00`
  );

  return eventDate < today;
}

canRegister(): boolean {
  return (
    this.event?.status === 'active' &&
    !this.isPastEvent() &&
    !!this.selectedTicket &&
    this.selectedTicket.available_quantity > 0 &&
    !this.isRegistering
  );
}

  goBack(): void {
    this.router.navigate(['/events']);
  }
}