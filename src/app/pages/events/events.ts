import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService } from '../../services/event';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events implements OnInit {

  events: Event[] = [];
  filteredEvents: Event[] = [];

  selectedCategory = '';
  selectedCity = '';
  selectedDate = '';

  categories: string[] = [];
  cities: string[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private eventService: EventService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void { //sayfa açılır açılmaz etkinlikleri getir.
    this.getEvents();
  }

  getEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        this.events = response.data ?? [];
        this.filteredEvents = [...this.events];

        this.createFilterOptions();

        this.isLoading = false;

        console.log('Etkinlikler:', this.events);

        this.changeDetector.detectChanges();
      },

      error: (error: unknown) => {
        console.error('Etkinlikler alınamadı:', error);

        this.events = [];
        this.filteredEvents = [];
        this.errorMessage = 'Etkinlikler alınamadı.';
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
    ?.trim()
    .toLocaleLowerCase('tr-TR') ?? '';

  const title = eventTitle
    ?.trim()
    .toLocaleLowerCase('tr-TR') ?? '';

  // Boncuk veya kolye etkinlikleri için özel görsel
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

  // Kategori eşleşmezse varsayılan görsel
  return '/images/events/conference.jpg';
}

  createFilterOptions(): void {
    this.categories = [
      ...new Set(
        this.events
          .filter(event => event.category)
          .map(event => event.category.category_name)
      )
    ];

    this.cities = [
      ...new Set(
        this.events
          .filter(event => event.location)
          .map(event => event.location.city)
      )
    ];
  }

  filterEvents(): void {
    this.filteredEvents = this.events.filter(event => {
      const categoryMatches =
        this.selectedCategory === '' ||
        event.category.category_name === this.selectedCategory;

      const cityMatches =
        this.selectedCity === '' ||
        event.location.city === this.selectedCity;

      const dateMatches =
        this.selectedDate === '' ||
        event.event_date === this.selectedDate;

      return categoryMatches && cityMatches && dateMatches;
    }); //etkinliğin gösterilebilmesi için kategori ve şehir ve tarih eşleşmeli
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedCity = '';
    this.selectedDate = '';

    this.filteredEvents = [...this.events];
  }

  goToEventDetail(eventId: number): void {
    this.router.navigate(['/events', eventId]);
  }
}