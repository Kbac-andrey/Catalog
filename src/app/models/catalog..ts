export interface ICatalogItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  creator: string;
  createdAt: string;
  approved: boolean;
}

export interface ICatalogState {
  loading: boolean;
  error: string | null;
  items: ICatalogItem[] | null;
  searching: boolean;
}



