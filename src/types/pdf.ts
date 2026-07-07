export interface PDFFile {
  id: string;
  name: string;
  data: ArrayBuffer;
  pageCount: number;
  size: number;
}

export type ActiveTab = 'editor' | 'merge' | 'split' | 'convert';

export interface TextAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
}

export interface StampAnnotation {
  id: string;
  x: number;
  y: number;
  name: string;
  color: string;
  size: number;
}
