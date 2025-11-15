import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogListComponent } from './catalog-list.component';
import { CatalogService } from '../../../services/catalog.service';
import { HeaderService } from '../../../services/header.service';
import { SearchStateService } from '../../../services/search-state.service';
import { FilterStateService } from '../../../services/filter-state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { ICatalogItem } from '../../../models/catalog.';

describe('CatalogListComponent', () => {
  let component: CatalogListComponent;
  let fixture: ComponentFixture<CatalogListComponent>;
  let catalogService: jasmine.SpyObj<CatalogService>;
  let headerService: jasmine.SpyObj<HeaderService>;
  let searchStateService: jasmine.SpyObj<SearchStateService>;
  let filterStateService: jasmine.SpyObj<FilterStateService>;

  const mockCatalogItems: ICatalogItem[] = [
    {
      id: '1',
      title: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      category: 'Electronics',
      tags: ['audio', 'wireless'],
      creator: 'test@example.com',
      createdAt: '2025-01-10T10:00:00.000Z',
      approved: false
    },
    {
      id: '2',
      title: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      category: 'Lighting',
      tags: ['LED'],
      creator: 'test@example.com',
      createdAt: '2025-01-10T10:00:00.000Z',
      approved: false
    },
    {
      id: '3',
      title: 'Wooden Chair',
      description: 'Comfortable wooden chair made of oak',
      category: 'Furniture',
      tags: ['wood', 'chair'],
      creator: 'test@example.com',
      createdAt: '2025-01-10T10:00:00.000Z',
      approved: false
    }
  ];

  beforeEach(async () => {
    const catalogServiceSpy = jasmine.createSpyObj('CatalogService', ['getCatalogItens']);
    const headerServiceSpy = jasmine.createSpyObj('HeaderService', ['setShowHeader']);
    const searchStateServiceSpy = jasmine.createSpyObj('SearchStateService', ['setSearchQuery', 'getSearchQuery'], {
      searchQuery$: of('')
    });
    searchStateServiceSpy.getSearchQuery.and.returnValue('');
    const filterStateServiceSpy = jasmine.createSpyObj('FilterStateService', ['getFilters', 'hasActiveFilters'], {
      filters$: of({ category: '', sortBy: '' })
    });

    await TestBed.configureTestingModule({
      imports: [CatalogListComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: CatalogService, useValue: catalogServiceSpy },
        { provide: HeaderService, useValue: headerServiceSpy },
        { provide: SearchStateService, useValue: searchStateServiceSpy },
        { provide: FilterStateService, useValue: filterStateServiceSpy }
      ]
    }).compileComponents();

    catalogService = TestBed.inject(CatalogService) as jasmine.SpyObj<CatalogService>;
    headerService = TestBed.inject(HeaderService) as jasmine.SpyObj<HeaderService>;
    searchStateService = TestBed.inject(SearchStateService) as jasmine.SpyObj<SearchStateService>;
    filterStateService = TestBed.inject(FilterStateService) as jasmine.SpyObj<FilterStateService>;

    catalogService.getCatalogItens.and.returnValue(of(mockCatalogItems));
    filterStateService.getFilters.and.returnValue({ category: '', sortBy: '' });
    filterStateService.hasActiveFilters.and.returnValue(false);
  });

  it('should create', () => {
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should call setShowHeader on ngOnInit', () => {
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    expect(headerService.setShowHeader).toHaveBeenCalledWith(true);
  });

  it('should emit loading state first, then success state with items', (done) => {
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    let loadedStateFound = false;
    component.state$.subscribe({
      next: (state) => {
        // Wait for loaded state with items
        if (!loadedStateFound && state.loading === false && state.items && state.items.length > 0) {
          loadedStateFound = true;
          expect(state.items).toEqual(mockCatalogItems);
          expect(state.error).toBeNull();
          done();
        }
      },
      error: (err) => {
        fail('Should not error: ' + err);
        done();
      }
    });
    
    // Timeout after 2 seconds
    setTimeout(() => {
      if (!loadedStateFound) {
        fail('Timeout: loaded state not found');
        done();
      }
    }, 2000);
  });

  it('should handle error when loading catalog items', (done) => {
    catalogService.getCatalogItens.and.returnValue(throwError(() => new Error('Failed to load')));
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const states: any[] = [];
    component.state$.subscribe({
      next: (state) => {
        states.push(state);
        if (states.length >= 2) {
          const errorState = states.find(s => s.error);
          if (errorState) {
            expect(errorState.loading).toBe(false);
            expect(errorState.error).toBe('Failed to load catalog items');
            expect(errorState.items).toBeNull();
            done();
          }
        }
      }
    });
  });

  it('should call setSearchQuery when onSearch is called', () => {
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    component.onSearch('test query');
    expect(searchStateService.setSearchQuery).toHaveBeenCalledWith('test query');
  });

  it('should trigger refresh when refresh is called', () => {
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const initialCallCount = catalogService.getCatalogItens.calls.count();
    component.refresh();
    
    // Should trigger another load
    expect(catalogService.getCatalogItens.calls.count()).toBeGreaterThan(initialCallCount);
  });

  it('should filter items by search query in title or description', (done) => {
    Object.defineProperty(searchStateService, 'searchQuery$', {
      value: of('Headphones'),
      writable: true
    });
    
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const states: any[] = [];
    component.state$.subscribe({
      next: (state) => {
        states.push(state);
        if (states.length >= 3 && !state.searching && state.items) {
          // After filtering, should only have item with "Headphones" in title
          expect(state.items.length).toBe(1);
          expect(state.items[0].title).toContain('Headphones');
          done();
        }
      }
    });
  });

  it('should filter items by category when category filter is applied', (done) => {
    Object.defineProperty(filterStateService, 'filters$', {
      value: of({ category: 'Electronics', sortBy: '' }),
      writable: true
    });
    filterStateService.hasActiveFilters.and.returnValue(true);
    
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const states: any[] = [];
    component.state$.subscribe({
      next: (state) => {
        states.push(state);
        if (states.length >= 3 && !state.searching && state.items) {
          // After filtering, should only have Electronics items
          expect(state.items.length).toBe(1);
          expect(state.items[0].category).toBe('Electronics');
          done();
        }
      }
    });
  });

  it('should combine search, category filter, and sorting correctly', (done) => {
    Object.defineProperty(searchStateService, 'searchQuery$', {
      value: of('lamp'),
      writable: true
    });
    Object.defineProperty(filterStateService, 'filters$', {
      value: of({ category: 'Lighting', sortBy: 'score-asc' }),
      writable: true
    });
    filterStateService.hasActiveFilters.and.returnValue(true);
    
    fixture = TestBed.createComponent(CatalogListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const states: any[] = [];
    component.state$.subscribe({
      next: (state) => {
        states.push(state);
        if (states.length >= 3 && !state.searching && state.items) {
          // Should filter by search (lamp) and category (Lighting), then sort
          expect(state.items.length).toBe(1);
          expect(state.items[0].title).toContain('Lamp');
          expect(state.items[0].category).toBe('Lighting');
          done();
        }
      }
    });
  });
});
