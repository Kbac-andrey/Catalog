// src/app/config/score-band.config.ts
import { ScoreBandName, IScoreBandConfig, IScoreRule } from './score';


export const SCORE_BANDS: IScoreBandConfig[] = [
  {
    name: ScoreBandName.Poor,
    min: 0,
    max: 49,
    cssClass: 'band-poor',
    canApprove: false
  },
  {
    name: ScoreBandName.Fair,
    min: 50,
    max: 74,
    cssClass: 'band-fair',
    canApprove: false
  },
  {
    name: ScoreBandName.Good,
    min: 75,
    max: 89,
    cssClass: 'band-good',
    canApprove: true
  },
  {
    name: ScoreBandName.Excellent,
    min: 90,
    max: 100,
    cssClass: 'band-excellent',
    canApprove: true
  }
];

export const SCORE_RULES: IScoreRule[] = [
    { condition: (item) => item.title?.length > 12, value: 20 },
    { condition: (item) => item.description?.length > 60, value: 15 },
    { condition: (item) => !!item.category?.trim(), value: 10 },
    { condition: (item) => item.tags?.length >= 1, value: 10 },
    { condition: (item) => item.tags?.length >= 2, value: 5 }
  ];