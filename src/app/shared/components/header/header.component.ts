import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  private readonly _router = inject(Router);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef = inject(DestroyRef);

  public ngOnInit(): void {
    this._router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });
  }

  public isAdmin(): boolean {
    const url = this._router.url;
    return url === '/admin' || url.startsWith('/admin/') || url.startsWith('/edit/');
  }
}


