import { Injectable } from '@angular/core';
import { InMemoryDbService, RequestInfo, ResponseOptions } from 'angular-in-memory-web-api';
import { ICatalogItem } from '../models/catalog.';

@Injectable({
  providedIn: 'root'
})
export class DataService implements InMemoryDbService {
  public readonly STORAGE_KEY = 'catalog-items-data';
  private _defaultItems: ICatalogItem[] = [
      {
        id: '1',
        title: 'Compact wooden chair',
        description: 'A stylish compact wooden chair made of oak. Comfortable and modern design.',
        category: 'Furniture',
        tags: ['wood', 'chair'],
        creator: 'alice@example.com',
        createdAt: '2025-01-10T10:00:00.000Z',
        approved: false
      },
      {
        id: '7',
        title: 'Compact wooden chair',
        description: 'A stylish compact wooden chair made of oak. Comfortable and modern design.',
        category: 'Furniture',
        tags: ['wood', 'chair'],
        creator: 'alice@example.com',
        createdAt: '2025-01-10T10:00:00.000Z',
        approved: false
      },
      {
        id: '4',
        title: 'Bad Item',
        description: 'Short desc.',
        category: 'Misc',
        tags: [],
        creator: 'test@example.com',
        createdAt: '2025-03-15T12:00:00.000Z',
        approved: false
      },
      {
        id: '2',
        title: 'Wireless noise-cancelling headphones with long battery life',
        description: 'Over-ear headphones delivering excellent sound quality and ANC for commuters.',
        category: 'Electronics',
        tags: ['audio', 'wireless', 'ANC'],
        creator: 'bob@example.com',
        createdAt: '2025-02-20T15:30:00.000Z',
        approved: true
      },
      {
        id: '3',
        title: 'Minimalist Desk Lamp',
        description: 'LED desk lamp with adjustable brightness and color temperature.',
        category: 'Lighting',
        tags: ['LED'],
        creator: 'carol@example.com',
        createdAt: '2025-03-05T09:45:00.000Z',
        approved: false
      },
    ];

  createDb(): { 'catalog-items': ICatalogItem[] } {
    // Load from localStorage if available, otherwise use default
    const savedData = this._loadFromStorage();
    if (savedData) {
      this._defaultItems = savedData;
    }
    return { 'catalog-items': [...this._defaultItems] };
  }

  put(reqInfo: RequestInfo): any {
    const collectionName = reqInfo.collectionName;
    
    if (collectionName === 'catalog-items') {
      // Get the updated item from the request body
      const updatedItem = reqInfo.utils.getJsonBody(reqInfo.req) as ICatalogItem;
      
      // Update the in-memory database
      const collection = reqInfo.collection;
      const index = collection.findIndex((item: any) => item.id === updatedItem.id);
      if (index !== -1) {
        collection[index] = updatedItem;
      }
      
      // Update _defaultItems to persist the change
      const defaultIndex = this._defaultItems.findIndex(item => item.id === updatedItem.id);
      if (defaultIndex !== -1) {
        this._defaultItems[defaultIndex] = updatedItem;
      }
      
      // Save to localStorage for persistence across refreshes
      this._saveToStorage();
      
      // Return the updated item as response
      return reqInfo.utils.createResponse$(() => {
        const options: ResponseOptions = {
          body: updatedItem,
          status: 200
        };
        return options;
      });
    }
    
    // Default behavior for other collections
    return undefined;
  }

  private _loadFromStorage(): ICatalogItem[] | null {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  private _saveToStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._defaultItems));
  }
}

