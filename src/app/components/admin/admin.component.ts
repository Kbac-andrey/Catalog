import { Component, inject, OnInit, ViewChild, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CatalogListComponent } from '../../shared/components/catalog-list/catalog-list.component';
import { CatalogService } from '../../services/catalog.service';
import { HeaderService } from '../../services/header.service';
import { ICatalogItem } from '../../models/catalog.';
import { computeScore } from '../../helpers/utils/compute-score';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, CatalogListComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminComponent implements OnInit {
  private readonly _catalogService = inject(CatalogService);
  private readonly _headerService = inject(HeaderService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);

  @ViewChild('catalogList') catalogListComponent?: CatalogListComponent;

  public approvingId: string | null = null;

  public ngOnInit(): void {
    this._headerService.setShowHeader(true);
  }

  public canApprove(item: ICatalogItem): boolean {
    return computeScore(item) >= 75;
  }

  public approveItem(item: ICatalogItem): void {
    if (this.approvingId === item.id) {
      return;
    }

    this.approvingId = item.id;
    this._catalogService.approveItem(item.id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: () => {
        if (this.catalogListComponent) {
          this.catalogListComponent.refresh();
        }
        this.approvingId = null;
      },
      error: () => {
        this.approvingId = null;
      }
    });
  }

  public editItem(id: string): void {
    this._router.navigate(['/edit', id]);
  }
}
