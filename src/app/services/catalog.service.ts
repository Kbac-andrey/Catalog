import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { ICatalogItem } from '../models/catalog.';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private readonly _httpClient = inject(HttpClient);

  public readonly API_URL: string = 'api/catalog-items';

  public getCatalogItens(): Observable<ICatalogItem[]> {
    return this._httpClient.get<ICatalogItem[]>(this.API_URL);
  }

  public getCatalogItem(id: string): Observable<ICatalogItem> {
    return this._httpClient.get<ICatalogItem>(`${this.API_URL}/${id}`);
  }

  public updateCatalogItem(item: ICatalogItem): Observable<ICatalogItem> {
    return this._httpClient.put<ICatalogItem>(`${this.API_URL}/${item.id}`, item);
  }

  public approveItem(id: string): Observable<ICatalogItem> {
    return this.getCatalogItem(id).pipe(
      switchMap(item => {
        const updatedItem = { ...item, approved: true };
        return this.updateCatalogItem(updatedItem);
      })
    );
  }
}

