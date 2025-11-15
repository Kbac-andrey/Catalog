import { ICatalogItem } from "../../models/catalog.";
import { SCORE_RULES } from "../../models/score-band.config";
import { IScoreRule } from "../../models/score";

export function computeScore(catalogItem: ICatalogItem): number {
    const base = 40;
  
    const bonus = SCORE_RULES
      .filter((rule: IScoreRule) => rule.condition(catalogItem))
      .reduce((sum: number, rule: IScoreRule) => sum + rule.value, 0);
  
    return Math.min(base + bonus, 100);
  }