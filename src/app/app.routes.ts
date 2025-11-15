import { Routes } from '@angular/router';
import { CatalogListComponent } from './shared/components/catalog-list/catalog-list.component';
import { AdminComponent } from './components/admin/admin.component';
import { CatalogDetailsComponent } from './components/catalog-details/catalog-details.component';
import { CatalogEditComponent } from './components/catalog-edit/catalog-edit.component';

export const routes: Routes = [
  { path: '', component: CatalogListComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'details/:id', component: CatalogDetailsComponent },
  { path: 'edit/:id', component: CatalogEditComponent },
  { path: '**', redirectTo: '' }
];
