import { Component, inject, OnInit, Input, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { FilterStateService, SortOption } from '../../../services/filter-state.service';
import { ICatalogItem } from '../../../models/catalog.';

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterComponent implements OnInit {
  private readonly _filterStateService = inject(FilterStateService);
  private readonly _destroyRef = inject(DestroyRef);

  @Input()
  public set items(value: ICatalogItem[] | null | undefined) {
    this._items = value ?? [];

    if (this.filterForm) {
      this._syncOptionsWithItems();
    }
  }

  public get items(): ICatalogItem[] {
    return this._items;
  }

  public filterForm!: FormGroup<{
    category: FormControl<string>;
    sortBy: FormControl<SortOption>;
  }>;
  public availableCategories: string[] = [];

  private _items: ICatalogItem[] = [];

  public ngOnInit(): void {
    this._initializeForm();
    this._setupFormSubscriptions();

    if (this._items.length > 0) {
      this._syncOptionsWithItems();
    }
  }

  public resetFilters(): void {
    this._filterStateService.resetFilters();
  }

  private _initializeForm(): void {
    const currentFilters = this._filterStateService.getFilters();
    
    this.filterForm = new FormGroup({
      category: new FormControl<string>(currentFilters.category, { nonNullable: true }),
      sortBy: new FormControl<SortOption>(currentFilters.sortBy, { nonNullable: true })
    });
  }

  private _setupFormSubscriptions(): void {
    const categoryControl = this.filterForm.controls.category;
    const sortByControl = this.filterForm.controls.sortBy;

    categoryControl.valueChanges.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(category => this._filterStateService.setCategory(category));

    sortByControl.valueChanges.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(sortBy => this._filterStateService.setSortBy(sortBy));

    this._filterStateService.filters$.pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(filters => {
      if (!this.filterForm) {
        return;
      }

      if (categoryControl.value !== filters.category) {
        categoryControl.setValue(filters.category, { emitEvent: false });
      }

      if (sortByControl.value !== filters.sortBy) {
        sortByControl.setValue(filters.sortBy, { emitEvent: false });
      }
    });
  }

  private _updateAvailableOptions(): void {
    const categories = new Set(this._items.map(item => item.category));
    this.availableCategories = Array.from(categories);
  }

  private _removeInvalidFilters(): void {
    const filters = this._filterStateService.getFilters();
    const categoryIsValid = !filters.category || this.availableCategories.includes(filters.category);

    if (!categoryIsValid) {
      this._filterStateService.setCategory('');
    }
  }

  private _syncOptionsWithItems(): void {
    this._updateAvailableOptions();
    this._removeInvalidFilters();
  }
}

