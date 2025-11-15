import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SortOption = '' | 'score-asc' | 'score-desc';

export interface IFilters {
  category: string;
  sortBy: SortOption;
}

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private FILTERS_SUBJECT$$ = new BehaviorSubject<IFilters>({
    category: '',
    sortBy: '',
  });

  public filters$: Observable<IFilters> = this.FILTERS_SUBJECT$$.asObservable();

  public setFilters(filters: IFilters): void {
    this.FILTERS_SUBJECT$$.next(filters);
  }

  public getFilters(): IFilters {
    return this.FILTERS_SUBJECT$$.value;
  }

  public setCategory(category: string): void {
    const currentFilters = this.getFilters();
    this.setFilters({ ...currentFilters, category });
  }

  public setSortBy(sortBy: SortOption): void {
    const currentFilters = this.getFilters();
    this.setFilters({ ...currentFilters, sortBy });
  }

  public resetFilters(): void {
    this.setFilters({
      category: '',
      sortBy: '',
    });
  }

  public hasActiveFilters(): boolean {
    const filters = this.getFilters();
    return !!filters.category || !!filters.sortBy;
  }
}


