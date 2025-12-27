
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED'
}

export interface Word {
  word: string;
  lexile: number;
  definition?: string;
}

export enum LexileRange {
  BR_200L = 'BR-200L',
  L200_400 = '200L-400L',
  L400_600 = '400L-600L',
  L600_800 = '600L-800L',
  L800_1000 = '800L-1000L',
  L1000_PLUS = '1000L+'
}

export interface ScoreData {
  totalScore: number;
  correctFirstTry: number;
  totalWords: number;
}
