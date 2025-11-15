import { Pipe, PipeTransform } from '@angular/core';
import { SCORE_BANDS } from '../models/score-band.config';
import { IScoreBandConfig } from '../models/score';

@Pipe({
  name: 'scoreBand',
  standalone: true,
  pure: true
})
export class ScoreBandPipe implements PipeTransform {
  transform(score: number): IScoreBandConfig {
    const s =  Math.round(score) || 0;

    return (
      SCORE_BANDS.find(band => s >= band.min && s <= band.max) ||
      SCORE_BANDS[0]
    );
  }
}
