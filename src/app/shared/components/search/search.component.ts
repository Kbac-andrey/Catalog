import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { SearchStateService } from '../../../services/search-state.service';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchComponent implements OnInit {
  private readonly _searchStateService = inject(SearchStateService);
  private readonly _destroyRef = inject(DestroyRef);

  @Output() search: EventEmitter<string> = new EventEmitter<string>();

  public readonly PLACEHOLDER: string = 'Search by title or description';
  public searchControl!: FormControl<string | null>;

  public ngOnInit(): void {
    const savedQuery = this._searchStateService.getSearchQuery();
    this.searchControl = new FormControl<string>(savedQuery || '');
    this._setupSearch();
  }

  private _setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe((value: string | null) => {
      const searchQuery = value || '';
      this._searchStateService.setSearchQuery(searchQuery);
      this.search.emit(searchQuery);
    });
  }
}

