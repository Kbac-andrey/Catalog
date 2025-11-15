import { Pipe, PipeTransform } from '@angular/core';
import { computeScore } from   '../helpers/utils/compute-score';
import { ICatalogItem } from '../models/catalog.';

@Pipe({
  name: 'score',
  standalone: true,
  pure: true
})
export class ScorePipe implements PipeTransform {
  transform(catalogItem: ICatalogItem | null | undefined): number {
    return catalogItem ? computeScore(catalogItem) : 0;
  }
}
