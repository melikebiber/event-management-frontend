import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Category,
  CategoryService
} from '../../services/category';

import {
  Location,
  LocationService
} from '../../services/location';

import { EventService } from '../../services/event';

import {
  Ticket,
  TicketService
} from '../../services/ticket';

interface CurrentUser {
  id: number;
  role?: string;
}

interface EventData {
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

@Component({
  selector: 'app-admin-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './admin-event-form.html',
  styleUrl: './admin-event-form.css'
})
export class AdminEventForm implements OnInit {

  categories: Category[] = [];
  locations: Location[] = [];
  tickets: Ticket[] = [];

  isLoadingOptions = true;
  isLoadingTickets = false;

  isSubmitting = false;
  isCreatingLocation = false;
  isSavingTicket = false;

  errorMessage = '';
  successMessage = '';

  locationErrorMessage = '';

  ticketErrorMessage = '';
  ticketSuccessMessage = '';

  showLocationForm = false;

  isEditMode = false;
  editingEventId: number | null = null;
  editingTicketId: number | null = null;

  showTicketManagementForm = false;

  /*
   * Etkinlik oluşturma ve düzenleme formu
   */
  eventForm = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3)
      ]
    }),

    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(10)
      ]
    }),

    event_date: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    start_time: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    end_time: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    capacity: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }
    ),

    status: new FormControl('active', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    category_id: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required
        ]
      }
    ),

    location_id: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required
        ]
      }
    )
  });

  /*
   * Yeni etkinlik oluşturulurken
   * ilk bilet kaydını oluşturmak için kullanılır.
   */
  ticketForm = new FormGroup({
    ticket_type: new FormControl('Standart', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    ticket_quantity: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }
    )
  });

  /*
   * Düzenleme sayfasında yeni bilet eklemek
   * veya mevcut bileti düzenlemek için kullanılır.
   */
  ticketManagementForm = new FormGroup({
    ticket_type: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    total_quantity: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }
    )
  });

  /*
   * Etkinlik formunun içinden
   * yeni konum oluşturmak için kullanılır.
   */
  locationForm = new FormGroup({
    location_name: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3)
      ]
    }),

    address: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    city: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    district: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required
      ]
    }),

    capacity: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(1)
        ]
      }
    )
  });

  constructor(
    private categoryService: CategoryService,
    private locationService: LocationService,
    private eventService: EventService,
    private ticketService: TicketService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const eventId =
      this.activatedRoute.snapshot.paramMap.get(
        'eventId'
      );

    if (eventId) {
      this.isEditMode = true;
      this.editingEventId = Number(eventId);
    }

    this.loadFormOptions();

    if (
      this.isEditMode &&
      this.editingEventId !== null
    ) {
      this.loadEventForEdit(
        this.editingEventId
      );

      this.loadTickets(
        this.editingEventId
      );
    }
  }

  /*
   * Düzenlenecek etkinliğin bilgilerini getirir
   * ve form alanlarını doldurur.
   */
  loadEventForEdit(eventId: number): void {
    this.eventService
      .getEventById(eventId)
      .subscribe({
        next: (response) => {
          const event =
            response.data ?? response;

          this.eventForm.patchValue({
            title:
              event.title,

            description:
              event.description,

            event_date:
              event.event_date,

            start_time:
              event.start_time,

            end_time:
              event.end_time,

            capacity:
              event.capacity,

            status:
              event.status,

            category_id:
              event.category?.category_id ??
              event.category_id,

            location_id:
              event.location?.location_id ??
              event.location_id
          });

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error(
            'Etkinlik bilgileri alınamadı:',
            error
          );

          this.errorMessage =
            error.error?.message ??
            'Düzenlenecek etkinlik bilgileri yüklenemedi.';

          this.changeDetector.detectChanges();
        }
      });
  }

  /*
   * Düzenlenen etkinliğe ait biletleri getirir.
   */
  loadTickets(eventId: number): void {
  this.isLoadingTickets = true;
  this.ticketErrorMessage = '';

  this.ticketService
    .getTicketsByEventId(eventId)
    .subscribe({
      next: (response) => {
        this.tickets = response.data ?? [];
        this.isLoadingTickets = false;

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error(
          'Biletler alınamadı:',
          error
        );

        this.tickets = [];
        this.isLoadingTickets = false;

        this.ticketErrorMessage =
          error.error?.message ??
          error.error?.error ??
          'Bilet bilgileri yüklenemedi.';

        this.changeDetector.detectChanges();
      },

      complete: () => {
        this.isLoadingTickets = false;
        this.changeDetector.detectChanges();
      }
    });
}

  /*
   * Kategorileri ve konumları backend'den getirir.
   */
  loadFormOptions(): void {
    this.isLoadingOptions = true;
    this.errorMessage = '';

    let categoriesLoaded = false;
    let locationsLoaded = false;

    const finishLoading = (): void => {
      if (
        categoriesLoaded &&
        locationsLoaded
      ) {
        this.isLoadingOptions = false;
        this.changeDetector.detectChanges();
      }
    };

    this.categoryService
      .getAllCategories()
      .subscribe({
        next: (response) => {
          this.categories =
            response.data ?? [];

          categoriesLoaded = true;
          finishLoading();
        },

        error: (error) => {
          console.error(
            'Kategoriler alınamadı:',
            error
          );

          this.errorMessage =
            'Kategoriler yüklenemedi.';

          categoriesLoaded = true;
          finishLoading();
        }
      });

    this.locationService
      .getAllLocations()
      .subscribe({
        next: (response) => {
          this.locations =
            response.data ?? [];

          locationsLoaded = true;
          finishLoading();
        },

        error: (error) => {
          console.error(
            'Konumlar alınamadı:',
            error
          );

          this.errorMessage =
            this.errorMessage ||
            'Konumlar yüklenemedi.';

          locationsLoaded = true;
          finishLoading();
        }
      });
  }

  /*
   * Etkinlik formu gönderildiğinde çalışır.
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();

      this.errorMessage =
        'Lütfen etkinlik alanlarını doğru şekilde doldur.';

      return;
    }

    /*
     * İlk bilet bilgisi sadece
     * yeni etkinlik oluşturulurken zorunludur.
     */
    if (
      !this.isEditMode &&
      this.ticketForm.invalid
    ) {
      this.ticketForm.markAllAsTouched();

      this.errorMessage =
        'Lütfen bilet türünü ve bilet kontenjanını doğru şekilde doldur.';

      return;
    }

    const currentUserText =
      localStorage.getItem('currentUser');

    if (!currentUserText) {
      this.router.navigate(['/login']);
      return;
    }

    let currentUser: CurrentUser;

    try {
      currentUser = JSON.parse(
        currentUserText
      ) as CurrentUser;
    } catch {
      this.errorMessage =
        'Kullanıcı bilgileri okunamadı.';

      return;
    }

    if (!currentUser.id) {
      this.errorMessage =
        'Organizatör kullanıcı bilgisi bulunamadı.';

      return;
    }

    const formData =
      this.eventForm.getRawValue();

    if (
      formData.start_time >=
      formData.end_time
    ) {
      this.errorMessage =
        'Bitiş saati başlangıç saatinden sonra olmalıdır.';

      return;
    }

    if (
      formData.capacity === null ||
      formData.category_id === null ||
      formData.location_id === null
    ) {
      this.errorMessage =
        'Kapasite, kategori ve konum alanları zorunludur.';

      return;
    }

    const eventData: EventData = {
      title:
        formData.title.trim(),

      description:
        formData.description.trim(),

      event_date:
        formData.event_date,

      start_time:
        formData.start_time,

      end_time:
        formData.end_time,

      capacity:
        formData.capacity,

      status:
        formData.status,

      organizer_id:
        currentUser.id,

      category_id:
        formData.category_id,

      location_id:
        formData.location_id
    };

    this.isSubmitting = true;

    /*
     * URL'de eventId varsa güncelleme işlemi yapılır.
     */
    if (
      this.isEditMode &&
      this.editingEventId !== null
    ) {
      this.updateExistingEvent(
        this.editingEventId,
        eventData
      );

      return;
    }

    /*
     * URL'de eventId yoksa
     * yeni etkinlik ve ilk bilet oluşturulur.
     */
    this.createEventWithTicket(
      eventData
    );
  }

  /*
   * Var olan etkinliği günceller.
   */
  private updateExistingEvent(
    eventId: number,
    eventData: EventData
  ): void {
    this.eventService
      .updateEvent(
        eventId,
        eventData
      )
      .subscribe({
        next: (response) => {
          this.isSubmitting = false;

          this.successMessage =
            response.message ??
            'Etkinlik başarıyla güncellendi.';

          this.changeDetector.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/admin']);
          }, 1000);
        },

        error: (error) => {
          console.error(
            'Etkinlik güncellenemedi:',
            error
          );

          this.isSubmitting = false;

          this.errorMessage =
            error.error?.message ??
            error.error?.error ??
            'Etkinlik güncellenirken bir hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });
  }

  /*
   * Önce etkinliği oluşturur.
   * Ardından oluşturulan event_id ile ilk bileti oluşturur.
   */
  private createEventWithTicket(
    eventData: EventData
  ): void {
    const ticketData =
      this.ticketForm.getRawValue();

    const ticketQuantity =
      ticketData.ticket_quantity;

    if (ticketQuantity === null) {
      this.isSubmitting = false;

      this.errorMessage =
        'Bilet kontenjanı zorunludur.';

      return;
    }

    this.eventService
      .createEvent(eventData)
      .subscribe({
        next: (eventResponse) => {
          const createdEvent =
            eventResponse.data ??
            eventResponse.event ??
            eventResponse;

          const createdEventId =
            createdEvent.event_id;

          if (!createdEventId) {
            this.isSubmitting = false;

            this.errorMessage =
              'Etkinlik oluşturuldu ancak etkinlik numarası alınamadı.';

            this.changeDetector.detectChanges();
            return;
          }

          const newTicketData = {
            event_id:
              createdEventId,

            ticket_type:
              ticketData.ticket_type.trim(),

            total_quantity:
              ticketQuantity,

            available_quantity:
              ticketQuantity
          };

          this.ticketService
            .createTicket(newTicketData)
            .subscribe({
              next: () => {
                this.isSubmitting = false;

                this.successMessage =
                  'Etkinlik ve bilet başarıyla oluşturuldu.';

                this.changeDetector.detectChanges();

                setTimeout(() => {
                  this.router.navigate(['/admin']);
                }, 1000);
              },

              error: (ticketError) => {
                console.error(
                  'Bilet oluşturulamadı:',
                  ticketError
                );

                this.isSubmitting = false;

                this.errorMessage =
                  ticketError.error?.message ??
                  ticketError.error?.error ??
                  'Etkinlik oluşturuldu ancak bilet oluşturulamadı.';

                this.changeDetector.detectChanges();
              }
            });
        },

        error: (eventError) => {
          console.error(
            'Etkinlik oluşturulamadı:',
            eventError
          );

          this.isSubmitting = false;

          this.errorMessage =
            eventError.error?.message ??
            eventError.error?.error ??
            'Etkinlik oluşturulurken bir hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });
  }

  /*
   * Yeni konum ekleme panelini açar veya kapatır.
   */
  toggleLocationForm(): void {
    this.showLocationForm =
      !this.showLocationForm;

    this.locationErrorMessage = '';

    if (!this.showLocationForm) {
      this.locationForm.reset();
    }
  }

  /*
   * Yeni konumu backend'e gönderir.
   */
  createLocation(): void {
    this.locationErrorMessage = '';

    if (this.locationForm.invalid) {
      this.locationForm.markAllAsTouched();

      this.locationErrorMessage =
        'Lütfen konum bilgilerini eksiksiz doldur.';

      return;
    }

    const formData =
      this.locationForm.getRawValue();

    if (formData.capacity === null) {
      this.locationErrorMessage =
        'Konum kapasitesi zorunludur.';

      return;
    }

    const locationData = {
      location_name:
        formData.location_name.trim(),

      address:
        formData.address.trim(),

      city:
        formData.city.trim(),

      district:
        formData.district.trim(),

      capacity:
        formData.capacity
    };

    this.isCreatingLocation = true;

    this.locationService
      .createLocation(locationData)
      .subscribe({
        next: (response) => {
          this.isCreatingLocation = false;

          const newLocation =
            response.data ??
            response.location;

          if (newLocation) {
            this.locations = [
              ...this.locations,
              newLocation
            ];

            this.eventForm.controls.location_id
              .setValue(
                newLocation.location_id
              );
          } else {
            this.reloadLocations();
          }

          this.locationForm.reset();
          this.showLocationForm = false;

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error(
            'Konum oluşturulamadı:',
            error
          );

          this.isCreatingLocation = false;

          this.locationErrorMessage =
            error.error?.message ??
            error.error?.error ??
            'Konum oluşturulurken hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });
  }

  /*
   * Konum oluşturulduktan sonra
   * konum listesini yeniden getirir.
   */
  private reloadLocations(): void {
    this.locationService
      .getAllLocations()
      .subscribe({
        next: (response) => {
          this.locations =
            response.data ?? [];

          this.changeDetector.detectChanges();
        },

        error: (error) => {
          console.error(
            'Konum listesi yenilenemedi:',
            error
          );
        }
      });
  }
openNewTicketForm(): void {
  this.editingTicketId = null;
  this.ticketErrorMessage = '';
  this.ticketSuccessMessage = '';

  this.ticketManagementForm.reset({
    ticket_type: '',
    total_quantity: null
  });

  this.showTicketManagementForm = true;
}

editTicket(ticket: Ticket): void {
  this.editingTicketId = ticket.ticket_id;
  this.ticketErrorMessage = '';
  this.ticketSuccessMessage = '';

  this.ticketManagementForm.patchValue({
    ticket_type: ticket.ticket_type,
    total_quantity: ticket.total_quantity
  });

  this.showTicketManagementForm = true;
}

cancelTicketForm(): void {
  this.editingTicketId = null;
  this.showTicketManagementForm = false;

  this.ticketErrorMessage = '';

  this.ticketManagementForm.reset({
    ticket_type: '',
    total_quantity: null
  });
}

saveTicket(): void {
  this.ticketErrorMessage = '';
  this.ticketSuccessMessage = '';

  if (this.ticketManagementForm.invalid) {
    this.ticketManagementForm.markAllAsTouched();

    this.ticketErrorMessage =
      'Lütfen bilet türünü ve kontenjanını doğru şekilde doldur.';

    return;
  }

  if (this.editingEventId === null) {
    this.ticketErrorMessage =
      'Etkinlik bilgisi bulunamadı.';

    return;
  }

  const formData =
    this.ticketManagementForm.getRawValue();

  if (formData.total_quantity === null) {
    this.ticketErrorMessage =
      'Bilet kontenjanı zorunludur.';

    return;
  }

  const ticketType =
    formData.ticket_type.trim();

  const totalQuantity =
    formData.total_quantity;

  this.isSavingTicket = true;

  // Mevcut bilet güncelleniyor
  if (this.editingTicketId !== null) {
    const currentTicket =
      this.tickets.find(
        ticket =>
          ticket.ticket_id ===
          this.editingTicketId
      );

    if (!currentTicket) {
      this.isSavingTicket = false;

      this.ticketErrorMessage =
        'Güncellenecek bilet bulunamadı.';

      return;
    }

    const soldQuantity =
      currentTicket.total_quantity -
      currentTicket.available_quantity;

    if (totalQuantity < soldQuantity) {
      this.isSavingTicket = false;

      this.ticketErrorMessage =
        `Toplam kontenjan, satılmış/kullanılmış ${soldQuantity} biletin altında olamaz.`;

      return;
    }

    const availableQuantity =
      totalQuantity - soldQuantity;

    this.ticketService
      .updateTicket(
        this.editingTicketId,
        {
          ticket_type: ticketType,
          total_quantity: totalQuantity,
          available_quantity:
            availableQuantity
        }
      )
      .subscribe({
        next: (response) => {
          this.isSavingTicket = false;

          this.ticketSuccessMessage =
            response.message ??
            'Bilet başarıyla güncellendi.';

          this.cancelTicketForm();
          this.ticketSuccessMessage =
            'Bilet başarıyla güncellendi.';

          this.loadTickets(
            this.editingEventId!
          );
        },

        error: (error) => {
          console.error(
            'Bilet güncellenemedi:',
            error
          );

          this.isSavingTicket = false;

          this.ticketErrorMessage =
            error.error?.message ??
            error.error?.error ??
            'Bilet güncellenirken hata oluştu.';

          this.changeDetector.detectChanges();
        }
      });

    return;
  }

  // Yeni bilet türü oluşturuluyor
  this.ticketService
    .createTicket({
      event_id: this.editingEventId,
      ticket_type: ticketType,
      total_quantity: totalQuantity,
      available_quantity: totalQuantity
    })
    .subscribe({
      next: (response) => {
  this.isSavingTicket = false;

  this.cancelTicketForm();

  this.ticketSuccessMessage =
    response.message ??
    'Yeni bilet türü başarıyla eklendi.';

  if (this.editingEventId !== null) {
    this.loadTickets(
      this.editingEventId
    );
  }

  this.changeDetector.detectChanges();
},

      error: (error) => {
        console.error(
          'Bilet oluşturulamadı:',
          error
        );

        this.isSavingTicket = false;

        this.ticketErrorMessage =
          error.error?.message ??
          error.error?.error ??
          'Bilet oluşturulurken hata oluştu.';

        this.changeDetector.detectChanges();
      }
    });
}

deleteTicket(ticket: Ticket): void {
  const confirmation = window.confirm(
    `"${ticket.ticket_type}" bilet türünü silmek istediğine emin misin?`
  );

  if (!confirmation) {
    return;
  }

  this.ticketErrorMessage = '';
  this.ticketSuccessMessage = '';

  this.ticketService
    .deleteTicket(ticket.ticket_id)
    .subscribe({
      next: (response) => {
        this.tickets =
          this.tickets.filter(
            item =>
              item.ticket_id !==
              ticket.ticket_id
          );

        this.ticketSuccessMessage =
          response.message ??
          'Bilet başarıyla silindi.';

        this.changeDetector.detectChanges();
      },

      error: (error) => {
        console.error(
          'Bilet silinemedi:',
          error
        );

        this.ticketErrorMessage =
          error.error?.message ??
          error.error?.error ??
          'Bilet silinirken hata oluştu.';

        this.changeDetector.detectChanges();
      }
    });
}
  /*
   * Admin paneline geri döner.
   */
  cancel(): void {
    this.router.navigate(['/admin']);
  }
}