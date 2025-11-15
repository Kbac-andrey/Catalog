import { Component, inject, OnInit, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { CatalogService } from '../../services/catalog.service';
import { HeaderService } from '../../services/header.service';
import { ICatalogItem } from '../../models/catalog.';
import { catchError, of, map, startWith, Observable, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forbiddenCharactersValidator, duplicateTagValidator } from '../../validators/catalog.validators';

@Component({
  selector: 'app-catalog-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalog-edit.component.html',
  styleUrl: './catalog-edit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogEditComponent implements OnInit {
  private readonly _activeRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _catalogService = inject(CatalogService);
  private readonly _headerService = inject(HeaderService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);

  public item$: Observable<{ loading: boolean; error: string | null; item: ICatalogItem | null }> = this._activeRoute.paramMap.pipe(
    map(params => params.get('id')),
    switchMap(id => this._catalogService.getCatalogItem(id!).pipe(
      map(item => ({ loading: false, error: null, item })),
      catchError(() => of({ loading: false, error: 'Failed to load catalog item', item: null })),
      startWith({ loading: true, error: null, item: null })
    ))
  );

  public editForm!: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    category: FormControl<string>;
    tags: FormArray<FormControl<string>>;
  }>;
  public saving: boolean = false;
  public saveError: string | null = null;

  private _currentItem: ICatalogItem | null = null;

  public ngOnInit(): void {
    this._headerService.setShowHeader(true);

    this.item$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(state => {
      if (state.item && !this.editForm) {
        this._currentItem = state.item;
        this._initializeForm(state.item);
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  public get tagsFormArray(): FormArray<FormControl<string>> {
    return this.editForm.get('tags') as FormArray<FormControl<string>>;
  }

  public addTag(): void {
    const newControl = new FormControl<string>('', { 
      nonNullable: true, 
      validators: [
        Validators.required,
        duplicateTagValidator(this.editForm.get('tags') as AbstractControl)
      ],
      updateOn: 'blur'
    });
    this.tagsFormArray.push(newControl);
    
    // Re-validate all tags when a new one is added
    this.tagsFormArray.controls.forEach(control => {
      control.updateValueAndValidity();
    });
    this._changeDetectorRef.markForCheck();
  }

  public removeTag(index: number): void {
    this.tagsFormArray.removeAt(index);
    // Re-validate remaining tags after removal
    this.tagsFormArray.controls.forEach(control => {
      control.updateValueAndValidity();
    });
    this._changeDetectorRef.markForCheck();
  }

  public cancel(): void {
    this._router.navigate(['/admin']);
  }

  public save(): void {
    if (this.editForm.invalid || this.saving || !this._currentItem) {
      return;
    }

    this.saving = true;
    this.saveError = null;

        const formValue = this.editForm.value;
        // Trim tags and remove duplicates
        const tags = formValue.tags?.filter(tag => tag && tag.trim()) || [];
        const uniqueTags = Array.from(new Set(tags.map(tag => tag.trim())));

        const updatedItem: ICatalogItem = {
          ...this._currentItem,
          title: formValue.title!.trim(),
          description: formValue.description!.trim(),
          category: formValue.category!.trim(),
          tags: uniqueTags
        };

    this._catalogService.updateCatalogItem(updatedItem).pipe(
      takeUntilDestroyed(this._destroyRef)
    ).subscribe({
      next: () => {
        this.saving = false;
        this._changeDetectorRef.markForCheck();
        this._router.navigate(['/admin']);
      },
      error: () => {
        this.saving = false;
        this.saveError = 'Failed to save changes';
        this._changeDetectorRef.markForCheck();
      }
    });
  }

  private _initializeForm(item: ICatalogItem): void {
    this.editForm = new FormGroup({
      title: new FormControl<string>(item.title, { 
        nonNullable: true, 
        validators: [
          Validators.required, 
          Validators.minLength(1),
          forbiddenCharactersValidator()
        ] 
      }),
      description: new FormControl<string>(item.description, { 
        nonNullable: true, 
        validators: [
          Validators.required, 
          Validators.minLength(1),
          forbiddenCharactersValidator()
        ] 
      }),
      category: new FormControl<string>(item.category, { 
        nonNullable: true, 
        validators: [
          Validators.required,
          forbiddenCharactersValidator()
        ] 
      }),
      tags: new FormArray<FormControl<string>>([])
    });

    // Add tag controls after form is created so validators can reference the form array
    const tagControls = item.tags.map(tag => 
      new FormControl<string>(tag, { 
        nonNullable: true, 
        validators: [
          Validators.required,
          duplicateTagValidator(this.editForm.get('tags') as AbstractControl)
        ],
        updateOn: 'blur'
      })
    );
    
    tagControls.forEach(control => {
      this.tagsFormArray.push(control);
    });
  }
}
