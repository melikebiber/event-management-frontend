//event.model.ts dosyasına yazdığımız kod, 
// backend’den gelen etkinlik verisinin nasıl bir yapıda olduğunu Angular’a anlatır.
// interface : Sadece verinin şeklini ve türlerini tanımlar.
export interface Organizer {
    user_id: number;
    name: string;
    surname: string;
    email: string;
}
export interface Category {
    category_id: number;
    category_name: string;
}
export interface Location {
    location_id: number;
    location_name: string;
    city: string;
    district: string;

}
export interface Event {
  event_id: number;
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
  created_at: string;

  organizer: Organizer;
  category: Category;
  location: Location;
}
export interface EventResponse {
    succes: boolean;
    data: Event[];
}