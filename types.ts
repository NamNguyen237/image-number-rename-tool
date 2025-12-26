export interface ProcessedFile {
  originalName: string;
  newName: string;
  path: string; // The folder path inside the zip
  status: 'renamed' | 'unchanged' | 'skipped';
}

export interface ProcessingStats {
  totalFiles: number;
  renamedCount: number;
  processedZipBlob: Blob | null;
}
