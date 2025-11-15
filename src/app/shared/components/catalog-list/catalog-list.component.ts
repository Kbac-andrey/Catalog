import { Component, inject, OnInit, ContentChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { LoadingComponent } from '../loading/loading.component';
import { CatalogService } from '../../../services/catalog.service';
import { HeaderService } from '../../../services/header.service';
import { SearchStateService } from '../../../services/search-state.service';
import { FilterStateService } from '../../../services/filter-state.service';
import { ICatalogState, ICatalogItem } from '../../../models/catalog.';
import { catchError, of, map, startWith, Observable, combineLatest, delay, switchMap, concat, Subject } from 'rxjs';
import { SearchComponent } from '../search/search.component';
import { FilterComponent } from '../filter/filter.component';
import { ScorePipe } from '../../../pipes/score.pipe';
import { ScoreBandPipe } from '../../../pipes/score-band.pipe';
import { computeScore } from '../../../helpers/utils/compute-score';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, ScrollingModule, LoadingComponent, SearchComponent, FilterComponent, ScorePipe, ScoreBandPipe, RouterLink],
  templateUrl: './catalog-list.component.html',
  styleUrl: './catalog-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogListComponent implements OnInit {
  private readonly _catalogService = inject(CatalogService);
  private readonly _headerService = inject(HeaderService);
  private readonly _searchStateService = inject(SearchStateService);
  private readonly _filterStateService = inject(FilterStateService);

  @ContentChild('itemActions', { static: false, read: TemplateRef }) itemActionsTemplate?: TemplateRef<{ $implicit: ICatalogItem }>;

  private _refreshTrigger$$ = new Subject<void>();

  public _allCategories$: Observable<ICatalogState> = this._refreshTrigger$$.pipe(
    startWith(void 0),
    switchMap(() => this._catalogService.getCatalogItens().pipe(
      map(items => {
        return <ICatalogState>{
          loading: false,
          error: null,
          items,
          searching: false,
        };
      }),
      catchError(() => {
        this._headerService.setShowHeader(true);
        return of<ICatalogState>({
          loading: false,
          error: 'Failed to load catalog items',
          items: null,
          searching: false,
        });
      }),
      startWith<ICatalogState>({
        loading: true,
        error: null,
        items: null,
        searching: false,
      })
    ))
  );

  public state$: Observable<ICatalogState> = combineLatest([
    this._allCategories$,
    this._searchStateService.searchQuery$.pipe(startWith('')),
    this._filterStateService.filters$.pipe(startWith(this._filterStateService.getFilters()))
  ]).pipe(
    switchMap(([state, searchQuery, currentFilters]) => {
      const hasSearchQuery = searchQuery && searchQuery.trim();
      
      if (!state.items) {
        return of({
          ...state,
          searching: false,
        });
      }

      // If there's a search query or filters, show searching state immediately
      if (hasSearchQuery || this._filterStateService.hasActiveFilters()) {
        // Emit searching state immediately, then after delay, emit filtered results
        const searchingState: ICatalogState = {
          ...state,
          searching: true,
        };
        
        // Capture searchQuery and filters in closure to ensure we use the correct values
        const currentSearchQuery = searchQuery.trim();
        const filtersToApply = { ...currentFilters };
        
        return concat(
          of(searchingState),
          of(null).pipe(
            delay(500),
            map(() => {
              let filteredItems = state.items!;
              
              // Apply search query filter
              if (currentSearchQuery) {
                filteredItems = this._filterBySearch(filteredItems, currentSearchQuery);
              }
              
              // Apply category filter
              if (filtersToApply.category) {
                filteredItems = filteredItems.filter((item: ICatalogItem) => item.category === filtersToApply.category);
              }
              
              // Apply sorting
              if (filtersToApply.sortBy) {
                filteredItems = this._sortItems(filteredItems, filtersToApply.sortBy);
              }
              
              return {
                ...state,
                items: filteredItems,
                searching: false,
              } as ICatalogState;
            })
          )
        );
      }

      // No search query or filters, but may have sorting
      let items = state.items!;
      if (currentFilters.sortBy) {
        items = this._sortItems(items, currentFilters.sortBy);
      }
      
      return of({
        ...state,
        items,
        searching: false,
      });
    })
  );

  public ngOnInit(): void {
    this._headerService.setShowHeader(true);
  }

  public onSearch(titleOrDescription: string): void {
    this._searchStateService.setSearchQuery(titleOrDescription);
  }

  public refresh(): void {
    this._refreshTrigger$$.next();
  }

  private _filterBySearch(items: ICatalogItem[], searchQuery: string): ICatalogItem[] {
    if (!searchQuery || !searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    
    return items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  }

  private _sortItems(items: ICatalogItem[], sortBy: string): ICatalogItem[] {
    if (!sortBy || sortBy === '') {
      return items;
    }

    const sortedItems = [...items];

    if (sortBy === 'score-desc') {
      return sortedItems.sort((a, b) => computeScore(b) - computeScore(a));
    } else if (sortBy === 'score-asc') {
      return sortedItems.sort((a, b) => computeScore(a) - computeScore(b));
    }

    return sortedItems;
  }
}

