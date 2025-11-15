import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError, delay } from 'rxjs';
import { AdminComponent } from './admin.component';
import { CatalogService } from '../../services/catalog.service';
import { HeaderService } from '../../services/header.service';
import { CatalogListComponent } from '../../shared/components/catalog-list/catalog-list.component';
import { ICatalogItem } from '../../models/catalog.';
import { ChangeDetectorRef } from '@angular/core';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let catalogService: jasmine.SpyObj<CatalogService>;
  let headerService: jasmine.SpyObj<HeaderService>;
  let router: jasmine.SpyObj<Router>;
  let changeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  const mockCatalogItem: ICatalogItem = {
    id: '1',
    title: 'Test Item',
    description: 'A test item with a long description that exceeds 60 characters to test the scoring system',
    category: 'Test Category',
    tags: ['tag1', 'tag2'],
    creator: 'test@example.com',
    createdAt: '2025-01-10T10:00:00.000Z',
    approved: false
  };

  const mockApprovedItem: ICatalogItem = {
    id: '2',
    title: 'Approved Item',
    description: 'An approved item with a long description that exceeds 60 characters',
    category: 'Test Category',
    tags: ['tag1'],
    creator: 'test@example.com',
    createdAt: '2025-01-10T10:00:00.000Z',
    approved: true
  };

  beforeEach(async () => {
    const catalogServiceSpy = jasmine.createSpyObj('CatalogService', ['approveItem']);
    const headerServiceSpy = jasmine.createSpyObj('HeaderService', ['setShowHeader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        { provide: CatalogService, useValue: catalogServiceSpy },
        { provide: HeaderService, useValue: headerServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: changeDetectorRefSpy }
      ]
    }).compileComponents();

    catalogService = TestBed.inject(CatalogService) as jasmine.SpyObj<CatalogService>;
    headerService = TestBed.inject(HeaderService) as jasmine.SpyObj<HeaderService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    changeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('approveItem', () => {
    let catalogListComponent: jasmine.SpyObj<CatalogListComponent>;

    beforeEach(() => {
      catalogListComponent = jasmine.createSpyObj('CatalogListComponent', ['refresh']);
      component.catalogListComponent = catalogListComponent as any;
    });

    it('should not approve if already approving the same item', () => {
      component.approvingId = mockCatalogItem.id;
      component.approveItem(mockCatalogItem);
      expect(catalogService.approveItem).not.toHaveBeenCalled();
    });

    it('should call approveItem service method with correct id', () => {
      catalogService.approveItem.and.returnValue(of(mockApprovedItem));
      component.approveItem(mockCatalogItem);
      expect(catalogService.approveItem).toHaveBeenCalledWith(mockCatalogItem.id);
    });

    it('should refresh catalog list and reset approvingId on success', () => {
      catalogService.approveItem.and.returnValue(of(mockApprovedItem));
      component.approveItem(mockCatalogItem);
      
      // Wait for async operation
      fixture.detectChanges();
      
      expect(catalogListComponent.refresh).toHaveBeenCalled();
      expect(component.approvingId).toBeNull();
    });

    it('should reset approvingId on error', () => {
      catalogService.approveItem.and.returnValue(throwError(() => new Error('Failed to approve')));
      component.approveItem(mockCatalogItem);
      
      // Wait for async operation
      fixture.detectChanges();
      
      expect(component.approvingId).toBeNull();
      expect(catalogListComponent.refresh).not.toHaveBeenCalled();
    });

    it('should not refresh catalog list if component is not available', () => {
      component.catalogListComponent = undefined;
      catalogService.approveItem.and.returnValue(of(mockApprovedItem));
      component.approveItem(mockCatalogItem);
      
      fixture.detectChanges();
      
      expect(component.approvingId).toBeNull();
    });
  });
});

