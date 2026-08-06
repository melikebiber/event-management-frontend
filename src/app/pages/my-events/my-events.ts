import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  Registration,
  RegistrationService
} from '../../services/registration';

import {
  EventService
} from '../../services/event';

interface CurrentUser {
  id: number;
  username?: string;
  email?: string;
}

type RatingField =
  | 'content_score'
  | 'organization_score'
  | 'location_score'
  | 'satisfaction_score';

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule
  ],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css'
})
export class MyEvents implements OnInit {

  registrations: Registration[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  currentUser: CurrentUser | null = null;

  isRatingModalOpen = false;
  isSubmittingRating = false;

  selectedRegistration:
    Registration | null = null;

  ratingForm = {
    content_score: 0,
    organization_score: 0,
    location_score: 0,
    satisfaction_score: 0,
    comment: ''
  };

  constructor(
    private registrationService:
      RegistrationService,

    private eventService:
      EventService,

    private router:
      Router,

    private changeDetector:
      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const storedUser =
      localStorage.getItem('currentUser');

    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      this.currentUser =
        JSON.parse(storedUser) as CurrentUser;

      this.getMyRegistrations();
    } catch (error) {
      console.error(
        'Kullanıcı bilgisi okunamadı:',
        error
      );

      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    }
  }

  getMyRegistrations(): void {
    if (!this.currentUser) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.registrationService
      .getUserRegistrations(
        this.currentUser.id
      )
      .subscribe({
        next: (response) => {
          this.registrations =
            response.data ?? [];

          this.isLoading = false;

          this.changeDetector
            .detectChanges();
        },

        error: (error) => {
          console.error(
            'Etkinlik kayıtları alınamadı:',
            error
          );

          this.registrations = [];
          this.isLoading = false;

          this.errorMessage =
            error.error?.message ??
            'Etkinlikler yüklenirken bir hata oluştu.';

          this.changeDetector
            .detectChanges();
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

  cancelRegistration(
    registration: Registration
  ): void {
    const confirmation =
      window.confirm(
        'Bu etkinlik için katılım kaydını iptal etmek istediğine emin misin?'
      );

    if (!confirmation) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.registrationService
      .cancelRegistration(
        registration.registration_id
      )
      .subscribe({
        next: (response) => {
          this.successMessage =
            response.message ??
            'Etkinlik kaydın başarıyla iptal edildi.';

          this.registrations =
            this.registrations.filter(
              item =>
                item.registration_id !==
                registration.registration_id
            );

          this.changeDetector
            .detectChanges();
        },

        error: (error) => {
          console.error(
            'Kayıt iptal edilemedi:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Kayıt iptal edilirken bir hata oluştu.';

          this.changeDetector
            .detectChanges();
        }
      });
  }

  isPastEvent(
    registration: Registration
  ): boolean {
    const eventDate =
      registration.event?.event_date;

    if (!eventDate) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateValue =
      new Date(`${eventDate}T00:00:00`);

    return eventDateValue < today;
  }

  openRatingModal(
    registration: Registration
  ): void {
    this.selectedRegistration =
      registration;

    this.ratingForm = {
      content_score: 0,
      organization_score: 0,
      location_score: 0,
      satisfaction_score: 0,
      comment: ''
    };

    this.errorMessage = '';
    this.successMessage = '';
    this.isRatingModalOpen = true;
  }

  closeRatingModal(): void {
    if (this.isSubmittingRating) {
      return;
    }

    this.isRatingModalOpen = false;
    this.selectedRegistration = null;
  }

  setRating(
    field: RatingField,
    score: number
  ): void {
    this.ratingForm[field] = score;
  }

  isRatingFormValid(): boolean {
    return (
      this.ratingForm.content_score >= 1 &&
      this.ratingForm.organization_score >= 1 &&
      this.ratingForm.location_score >= 1 &&
      this.ratingForm.satisfaction_score >= 1
    );
  }

  submitRating(): void {
    const eventId =
      this.selectedRegistration
        ?.event
        ?.event_id;

    if (!eventId) {
      this.errorMessage =
        'Etkinlik bilgisi bulunamadı.';

      return;
    }

    if (!this.isRatingFormValid()) {
      this.errorMessage =
        'Lütfen bütün değerlendirme başlıklarına puan verin.';

      return;
    }

    this.isSubmittingRating = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.eventService
      .createRating(
        eventId,
        {
          content_score:
            this.ratingForm.content_score,

          organization_score:
            this.ratingForm
              .organization_score,

          location_score:
            this.ratingForm.location_score,

          satisfaction_score:
            this.ratingForm
              .satisfaction_score,

          comment:
            this.ratingForm
              .comment
              .trim()
        }
      )
      .subscribe({
        next: (response) => {
          this.isSubmittingRating = false;
          this.isRatingModalOpen = false;
          this.selectedRegistration = null;

          this.successMessage =
            response.message ??
            'Değerlendirmeniz başarıyla kaydedildi.';

          this.changeDetector
            .detectChanges();
        },

        error: (error) => {
          console.error(
            'Değerlendirme gönderilemedi:',
            error
          );

          this.isSubmittingRating = false;

          this.errorMessage =
            error.error?.message ??
            'Değerlendirme gönderilirken bir hata oluştu.';

          this.changeDetector
            .detectChanges();
        }
      });
  }
}