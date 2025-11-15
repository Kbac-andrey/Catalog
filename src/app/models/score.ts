
export interface IScoreBandConfig {
    name: ScoreBandName;
    min: number;
    max: number;
    cssClass: string;
    canApprove: boolean;
  }

  export interface IScoreRule {
    condition: (item: any) => boolean;
    value: number;
  }

  export enum ScoreBandName {
    Poor = 'Poor',
    Fair = 'Fair',
    Good = 'Good',
    Excellent = 'Excellent'
  }
