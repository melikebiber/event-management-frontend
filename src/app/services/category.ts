import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  category_id: number;
  category_name: string;
  description?: string;
}

interface CategoryResponse {
  success: boolean;
  data: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

 private apiUrl =
  'https://event-management-backend-bay.vercel.app/categories';
  constructor(
    private http: HttpClient
  ) {}

  // Tüm kategorileri getirir
  getAllCategories(): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(
      this.apiUrl
    );
  }
}