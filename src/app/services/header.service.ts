import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  public readonly SHOW_HEADER = signal<boolean>(false);

  public setShowHeader(value: boolean): void {
    this.SHOW_HEADER.set(value);
  }
}


