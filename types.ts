
export interface Recipe {
  rawContent: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  SELECTING_LANGUAGE = 'SELECTING_LANGUAGE',
  SELECTING_STATE = 'SELECTING_STATE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
