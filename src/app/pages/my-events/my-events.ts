import {
  ChangeDetectorRef,
  Component,
  OnInit 
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  Registration,
  RegistrationService
} from '../../services/registration';

interface CurrentUser {
  id: number;
  username?: string;
  email?: string;
}

@Component({
  selector: 'app-my-events',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './my-events.html',
  styleUrl: './my-events.css'
})
export class MyEvents implements OnInit { //OnInit, Angular bileşeni açıldığı anda çalıştırılacak başlangıç işlemlerini tanımlamamızı sağlar.

  registrations: Registration[] = [];

  isLoading = true;
  errorMessage = '';
  successMessage = '';

  currentUser: CurrentUser | null = null;

  constructor(
    private registrationService: RegistrationService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    const storedUser = localStorage.getItem('currentUser');

    if (!storedUser) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      this.currentUser = JSON.parse(storedUser) as CurrentUser;
      this.getMyRegistrations();
    } catch (error) {
      console.error('Kullanıcı bilgisi okunamadı:', error);

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
      .getUserRegistrations(this.currentUser.id)
      .subscribe({
        next: (response) => {
          this.registrations = response.data ?? [];
          this.isLoading = false;

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error('Etkinlik kayıtları alınamadı:', error);

          this.registrations = [];
          this.isLoading = false;
          this.errorMessage =
            error.error?.message ??
            'Etkinlikler yüklenirken bir hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });
  }
getEventImage(
  categoryName: string,
  eventTitle: string
): string {
  const category = categoryName
    ?.trim()
    .toLocaleLowerCase('tr-TR') ?? '';

  const title = eventTitle
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
  cancelRegistration(registration: Registration): void {
    const confirmation = window.confirm(
      'Bu etkinlik için katılım kaydını iptal etmek istediğine emin misin?'
    );

    if (!confirmation) {
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    this.registrationService
      .cancelRegistration(registration.registration_id)
      .subscribe({
        next: (response) => {
          this.successMessage =
            response.message ??
            'Etkinlik kaydın başarıyla iptal edildi.';

          this.registrations = this.registrations.filter(
            item =>
              item.registration_id !== registration.registration_id
          );

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error('Kayıt iptal edilemedi:', error);

          this.errorMessage =
            error.error?.message ??
            'Kayıt iptal edilirken bir hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });
  }
}