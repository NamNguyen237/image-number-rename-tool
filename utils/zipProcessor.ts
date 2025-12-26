import JSZip from 'jszip';
import { ProcessedFile, ProcessingStats } from '../types';

/**
 * Replicates the Python regex logic: r'^(\d+)(.*)'
 * Matches a number at the start of the string, capturing the number and the rest.
 */
const NUMBER_PATTERN = /^(\d+)(.*)/;

export const processZipFile = async (
  file: File,
  paddingLength: number,
  onProgress: (percent: number) => void
): Promise<[ProcessedFile[], ProcessingStats]> => {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);
  
  const processedFiles: ProcessedFile[] = [];
  const newZip = new JSZip();
  
  let renamedCount = 0;
  const filesToProcess: string[] = [];
  
  // First pass: Collect files (ignore directories for direct processing, but keep structure)
  loadedZip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      filesToProcess.push(relativePath);
    }
  });

  const totalFiles = filesToProcess.length;
  let processedCount = 0;

  for (const relativePath of filesToProcess) {
    const fileData = await loadedZip.file(relativePath)?.async('blob');
    
    if (!fileData) continue;

    // Handle paths: "folder/subfolder/1.jpg" -> split to get filename
    const pathParts = relativePath.split('/');
    const originalFilename = pathParts.pop() || ''; // Get the last part (filename)
    const folderPath = pathParts.join('/'); // Reconstruct folder path
    
    let newFilename = originalFilename;
    let status: ProcessedFile['status'] = 'unchanged';

    const match = originalFilename.match(NUMBER_PATTERN);

    if (match) {
      const numberPart = match[1];
      const remainingPart = match[2];

      // Python Logic: padded_number = number_part.zfill(padding_length)
      const paddedNumber = numberPart.padStart(paddingLength, '0');
      
      const candidateName = `${paddedNumber}${remainingPart}`;

      if (candidateName !== originalFilename) {
        newFilename = candidateName;
        status = 'renamed';
        renamedCount++;
      }
    }

    // Reconstruct full path for the new zip
    const newRelativePath = folderPath ? `${folderPath}/${newFilename}` : newFilename;

    // Add to new zip
    newZip.file(newRelativePath, fileData);

    processedFiles.push({
      originalName: originalFilename,
      newName: newFilename,
      path: folderPath,
      status
    });

    processedCount++;
    onProgress(Math.round((processedCount / totalFiles) * 100));
  }

  // Generate the new zip file
  const generatedBlob = await newZip.generateAsync({ type: 'blob' });

  return [
    processedFiles,
    {
      totalFiles,
      renamedCount,
      processedZipBlob: generatedBlob
    }
  ];
};
