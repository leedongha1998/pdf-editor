export interface PDFFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
  size: number;
}

export type ActiveTab = 'editor' | 'merge' | 'split' | 'convert';
