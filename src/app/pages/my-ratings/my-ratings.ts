import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import {
  UserRating,
  UserService
} from '../../services/user';

interface HttpErrorResponse {
  status?: number;

  error?: {
    message?: string;
  };
}

@Component({
  selector: 'app-my-ratings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './my-ratings.html',
  styleUrl: './my-ratings.css'
})
export class MyRatings implements OnInit {

  myRatings: UserRating[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadMyRatings();
  }

  loadMyRatings(): void {
    const token = localStorage.getItem('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.userService
      .getMyRatings()
      .subscribe({
        next: (response) => {
          this.myRatings =
            response.data ?? [];

          this.isLoading = false;

          this.changeDetector.detectChanges();
        },

        error: (error: HttpErrorResponse) => {
          console.error(
            'Değerlendirmeler alınamadı:',
            error
          );

          this.myRatings = [];
          this.isLoading = false;

          this.errorMessage =
            error.error?.message ??
            'Değerlendirmeler yüklenirken bir hata oluştu.';

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

  isStarActive(
    score: number,
    star: number
  ): boolean {
    return star <= Math.round(score);
  }
}