import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterComponent } from './filter.component';
import { FilterStateService } from '../../../services/filter-state.service';
import { of } from 'rxjs';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  let filterStateService: jasmine.SpyObj<FilterStateService>;

  beforeEach(async () => {
    const filterStateServiceSpy = jasmine.createSpyObj('FilterStateService', ['resetFilters', 'getFilters'], {
      filters$: of({ category: '', sortBy: '' })
    });

    await TestBed.configureTestingModule({
      imports: [FilterComponent],
      providers: [
        { provide: FilterStateService, useValue: filterStateServiceSpy }
      ]
    }).compileComponents();

    filterStateService = TestBed.inject(FilterStateService) as jasmine.SpyObj<FilterStateService>;
    filterStateService.getFilters.and.returnValue({ category: '', sortBy: '' });

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call resetFilters on FilterStateService when resetFilters is called', () => {
    component.resetFilters();
    expect(filterStateService.resetFilters).toHaveBeenCalled();
  });
});

