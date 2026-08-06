import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  Router,
  RouterLink
} from '@angular/router';

import {
  Registration,
  RegistrationService
} from '../../services/registration';

interface CurrentUser {
  id: number;
}

interface HttpErrorResponse {
  status?: number;

  error?: {
    message?: string;
  };
}

@Component({
  selector: 'app-cancelled-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './cancelled-events.html',
  styleUrl: './cancelled-events.css'
})
export class CancelledEvents implements OnInit {

  cancelledRegistrations: Registration[] = [];

  isLoading = true;
  errorMessage = '';

  currentUser: CurrentUser | null = null;

  constructor(
    private registrationService:
      RegistrationService,

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

      this.loadCancelledRegistrations();
    } catch (error) {
      console.error(
        'Kullanıcı bilgisi okunamadı:',
        error
      );

      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    }
  }

  loadCancelledRegistrations(): void {
    if (!this.currentUser) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.registrationService
      .getUserCancelledRegistrations(
        this.currentUser.id
      )
      .subscribe({
        next: (response) => {
          this.cancelledRegistrations =
            response.data ?? [];

          this.isLoading = false;

          this.changeDetector.detectChanges();
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'İptal edilen etkinlikler alınamadı:',
            error
          );

          this.cancelledRegistrations = [];
          this.isLoading = false;

          this.errorMessage =
            error.error?.message ??
            'İptal edilen etkinlikler yüklenirken bir hata oluştu.';

          if (
            error.status === 401 ||
            error.status === 403
          ) {
            this.router.navigate(['/login']);
            return;
          }

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
}