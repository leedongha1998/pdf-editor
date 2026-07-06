import { PDFDocument, degrees } from 'pdf-lib';

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

export async function rotatePage(
  data: ArrayBuffer,
  pageIndex: number,
  angle: 90 | -90
): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.load(data);
  const page = pdfDoc.getPage(pageIndex);
  const currentRotation = page.getRotation().angle;
  page.setRotation(degrees(currentRotation + angle));
  return toArrayBuffer(await pdfDoc.save());
}

export async function deletePage(data: ArrayBuffer, pageIndex: number): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.load(data);
  pdfDoc.removePage(pageIndex);
  return toArrayBuffer(await pdfDoc.save());
}

export async function reorderPages(data: ArrayBuffer, newOrder: number[]): Promise<ArrayBuffer> {
  const srcDoc = await PDFDocument.load(data);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, newOrder);
  copiedPages.forEach((page) => newDoc.addPage(page));
  return toArrayBuffer(await newDoc.save());
}

export async function mergePDFs(dataList: ArrayBuffer[]): Promise<ArrayBuffer> {
  const mergedDoc = await PDFDocument.create();
  for (const data of dataList) {
    const srcDoc = await PDFDocument.load(data);
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }
  return toArrayBuffer(await mergedDoc.save());
}

export async function splitPDF(
  data: ArrayBuffer,
  pageIndices: number[]
): Promise<ArrayBuffer> {
  const srcDoc = await PDFDocument.load(data);
  const newDoc = await PDFDocument.create();
  const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => newDoc.addPage(page));
  return toArrayBuffer(await newDoc.save());
}

export async function imagesToPDF(files: File[]): Promise<ArrayBuffer> {
  const pdfDoc = await PDFDocument.create();
  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const imgBytes = new Uint8Array(arrayBuffer);
    let image;
    if (file.type === 'image/png') {
      image = await pdfDoc.embedPng(imgBytes);
    } else {
      image = await pdfDoc.embedJpg(imgBytes);
    }
    const { width, height } = image.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, { x: 0, y: 0, width, height });
  }
  return toArrayBuffer(await pdfDoc.save());
}

export function downloadBuffer(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
