import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchStateService {
  private _SEARCH_QUERY$$ = new BehaviorSubject<string>('');
  public searchQuery$: Observable<string> = this._SEARCH_QUERY$$.asObservable();

  public setSearchQuery(query: string): void {
    this._SEARCH_QUERY$$.next(query);
  }

  public getSearchQuery(): string {
    return this._SEARCH_QUERY$$.value;
  }
}

