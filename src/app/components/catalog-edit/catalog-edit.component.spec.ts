import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError, delay } from 'rxjs';
import { CatalogEditComponent } from './catalog-edit.component';
import { CatalogService } from '../../services/catalog.service';
import { HeaderService } from '../../services/header.service';
import { ICatalogItem } from '../../models/catalog.';

describe('CatalogEditComponent', () => {
  let component: CatalogEditComponent;
  let fixture: ComponentFixture<CatalogEditComponent>;
  let catalogService: jasmine.SpyObj<CatalogService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

  const mockCatalogItem: ICatalogItem = {
    id: '1',
    title: 'Test Item',
    description: 'A test item description',
    category: 'Test Category',
    tags: ['tag1', 'tag2'],
    creator: 'test@example.com',
    createdAt: '2025-01-10T10:00:00.000Z',
    approved: false
  };

  beforeEach(async () => {
    const catalogServiceSpy = jasmine.createSpyObj('CatalogService', ['getCatalogItem', 'updateCatalogItem']);
    const headerServiceSpy = jasmine.createSpyObj('HeaderService', ['setShowHeader']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRoute = {
      paramMap: of(convertToParamMap({ id: '1' }))
    };

    await TestBed.configureTestingModule({
      imports: [CatalogEditComponent],
      providers: [
        { provide: CatalogService, useValue: catalogServiceSpy },
        { provide: HeaderService, useValue: headerServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ]
    }).compileComponents();

    catalogService = TestBed.inject(CatalogService) as jasmine.SpyObj<CatalogService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    catalogService.getCatalogItem.and.returnValue(of(mockCatalogItem));

    fixture = TestBed.createComponent(CatalogEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    beforeEach((done) => {
      component.ngOnInit();
      setTimeout(() => {
        fixture.detectChanges();
        done();
      }, 100);
    });

    it('should validate required fields', () => {
      component.editForm.get('title')?.setValue('');
      component.editForm.get('description')?.setValue('');
      component.editForm.get('category')?.setValue('');

      expect(component.editForm.get('title')?.hasError('required')).toBe(true);
      expect(component.editForm.get('description')?.hasError('required')).toBe(true);
      expect(component.editForm.get('category')?.hasError('required')).toBe(true);
    });

    it('should validate forbidden characters in title', () => {
      component.editForm.get('title')?.setValue('Test <script>');
      expect(component.editForm.get('title')?.hasError('forbiddenCharacters')).toBe(true);
    });

    it('should validate forbidden characters in description', () => {
      component.editForm.get('description')?.setValue('Test {invalid}');
      expect(component.editForm.get('description')?.hasError('forbiddenCharacters')).toBe(true);
    });

    it('should validate forbidden characters in category', () => {
      component.editForm.get('category')?.setValue('Test [invalid]');
      expect(component.editForm.get('category')?.hasError('forbiddenCharacters')).toBe(true);
    });

    it('should allow valid input without forbidden characters', () => {
      component.editForm.get('title')?.setValue('Valid Title');
      component.editForm.get('description')?.setValue('Valid description text');
      component.editForm.get('category')?.setValue('Valid Category');

      expect(component.editForm.get('title')?.hasError('forbiddenCharacters')).toBe(false);
      expect(component.editForm.get('description')?.hasError('forbiddenCharacters')).toBe(false);
      expect(component.editForm.get('category')?.hasError('forbiddenCharacters')).toBe(false);
    });
  });

  describe('save', () => {
    beforeEach((done) => {
      component.ngOnInit();
      setTimeout(() => {
        fixture.detectChanges();
        done();
      }, 100);
    });

    it('should not save if form is invalid', () => {
      component.editForm.get('title')?.setValue('');
      component.save();
      expect(catalogService.updateCatalogItem).not.toHaveBeenCalled();
    });

    it('should not save if already saving', () => {
      component.saving = true;
      component.save();
      expect(catalogService.updateCatalogItem).not.toHaveBeenCalled();
    });

    it('should not save if currentItem is null', () => {
      (component as any)._currentItem = null;
      component.save();
      expect(catalogService.updateCatalogItem).not.toHaveBeenCalled();
    });

    it('should trim title, description, and category on save', () => {
      component.editForm.get('title')?.setValue('  Trimmed Title  ');
      component.editForm.get('description')?.setValue('  Trimmed Description  ');
      component.editForm.get('category')?.setValue('  Trimmed Category  ');
      
      catalogService.updateCatalogItem.and.returnValue(of(mockCatalogItem));
      component.save();
      
      expect(catalogService.updateCatalogItem).toHaveBeenCalled();
      const callArgs = catalogService.updateCatalogItem.calls.mostRecent().args[0];
      expect(callArgs.title).toBe('Trimmed Title');
      expect(callArgs.description).toBe('Trimmed Description');
      expect(callArgs.category).toBe('Trimmed Category');
    });

    it('should process tags correctly on save', () => {
      component.tagsFormArray.controls[0].setValue('tag1');
      component.tagsFormArray.controls[1].setValue('tag2');
      
      component.editForm.get('title')?.setValue('Valid Title');
      component.editForm.get('description')?.setValue('Valid description');
      component.editForm.get('category')?.setValue('Valid Category');
      
      catalogService.updateCatalogItem.and.returnValue(of(mockCatalogItem));
      component.save();
      
      expect(catalogService.updateCatalogItem).toHaveBeenCalled();
      const callArgs = catalogService.updateCatalogItem.calls.mostRecent().args[0];

      expect(callArgs.tags).toBeDefined();
      expect(Array.isArray(callArgs.tags)).toBe(true);
    });

    it('should trim tags and remove empty tags on save', () => {
      component.tagsFormArray.controls[0].setValue('  tag1  ');
      component.tagsFormArray.controls[0].markAsTouched();
      component.tagsFormArray.controls[1].setValue('  ');
      component.tagsFormArray.controls[1].markAsTouched();
      
      catalogService.updateCatalogItem.and.returnValue(of(mockCatalogItem));
      component.save();
      
      expect(catalogService.updateCatalogItem).toHaveBeenCalled();
      const callArgs = catalogService.updateCatalogItem.calls.mostRecent().args[0];
      // Should have trimmed 'tag1' and removed empty tag
      expect(callArgs.tags).toContain('tag1');
      expect(callArgs.tags).not.toContain('');
      expect(callArgs.tags.every((t: string) => t.trim() === t)).toBe(true);
    });

    it('should set saving to true when saving', (done) => {
      catalogService.updateCatalogItem.and.returnValue(of(mockCatalogItem).pipe(
        delay(10)
      ));
      component.save();
      expect(component.saving).toBe(true);
      
      setTimeout(() => {
        expect(component.saving).toBe(false);
        done();
      }, 20);
    });

    it('should clear saveError when saving', () => {
      component.saveError = 'Previous error';
      catalogService.updateCatalogItem.and.returnValue(of(mockCatalogItem));
      component.save();
      expect(component.saveError).toBeNull();
    });

    it('should navigate to admin and reset saving on success', (done) => {
      catalogService.updateCatalogItem.and.returnValue(of(mockCatalogItem));
      component.save();
      
      setTimeout(() => {
        expect(router.navigate).toHaveBeenCalledWith(['/admin']);
        expect(component.saving).toBe(false);
        done();
      }, 100);
    });

    it('should set saveError and reset saving on error', (done) => {
      catalogService.updateCatalogItem.and.returnValue(throwError(() => new Error('Save failed')));
      component.save();
      
      setTimeout(() => {
        expect(component.saveError).toBe('Failed to save changes');
        expect(component.saving).toBe(false);
        expect(router.navigate).not.toHaveBeenCalled();
        done();
      }, 100);
    });
  });
});

