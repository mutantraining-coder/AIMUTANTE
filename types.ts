export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface GeneratedImage {
  mimeType: string;
  data: string; // base64 string
}

export interface EditRequest {
  image: File;
  prompt: string;
}
