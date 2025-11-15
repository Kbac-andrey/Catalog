import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { HeaderService } from '../../services/header.service';
import { ICatalogItem } from '../../models/catalog.';
import { catchError, of, map, startWith, Observable, switchMap } from 'rxjs';
import { ScoreBandPipe } from '../../pipes/score-band.pipe';
import { computeScore } from '../../helpers/utils/compute-score';

@Component({
  selector: 'app-catalog-details',
  standalone: true,
  imports: [CommonModule, ScoreBandPipe, DatePipe],
  templateUrl: './catalog-details.component.html',
  styleUrl: './catalog-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogDetailsComponent implements OnInit {
  private readonly _route = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _catalogService = inject(CatalogService);
  private readonly _headerService = inject(HeaderService);

  public item$: Observable<{ loading: boolean; error: string | null; item: ICatalogItem | null }> = this._route.paramMap.pipe(
    map(params => params.get('id')),
    switchMap(id => {
      if (!id) {
        return of({ loading: false, error: 'Invalid item ID', item: null });
      }
      return this._catalogService.getCatalogItem(id).pipe(
        map(item => ({ loading: false, error: null, item })),
        catchError(() => of({ loading: false, error: 'Failed to load catalog item', item: null })),
        startWith({ loading: true, error: null, item: null })
      );
    })
  );

  public ngOnInit(): void {
    this._headerService.setShowHeader(true);
  }

  public goBack(): void {
    this._router.navigate(['/']);
  }

  public getScore(item: ICatalogItem): number {
    return computeScore(item);
  }
}
