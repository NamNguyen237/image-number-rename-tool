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
  generateHtmlReader: boolean,
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
    // Only process files, ignore Mac OS X metadata
    if (!zipEntry.dir && !relativePath.startsWith('__MACOSX/')) {
      filesToProcess.push(relativePath);
    }
  });

  const totalFiles = filesToProcess.length;
  let processedCount = 0;
  
  // Track images if we need to generate HTML
  const imagePaths: string[] = [];
  const validExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.gif'];

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
    
    // Check if it's an image
    const lowerName = newFilename.toLowerCase();
    if (validExtensions.some(ext => lowerName.endsWith(ext))) {
      imagePaths.push(newRelativePath);
    }

    processedFiles.push({
      originalName: originalFilename,
      newName: newFilename,
      path: folderPath,
      status
    });

    processedCount++;
    onProgress(Math.round((processedCount / totalFiles) * 100));
  }

  if (generateHtmlReader && imagePaths.length > 0) {
    // Sort logically like python does
    imagePaths.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    const imagesHtml = imagePaths.map(imgPath => `        <img class="page" src="${imgPath}" alt="${imgPath}" loading="lazy">`).join('\n');
    
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trình đọc ảnh cục bộ</title>
    <style>
        body {
            background-color: #121212; /* Nền tối bảo vệ mắt */
            color: #ffffff;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            font-family: sans-serif;
        }
        /* Cửa sổ điều khiển động nổi trên màn hình */
        .control-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(30, 30, 30, 0.85);
            padding: 10px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
            backdrop-filter: blur(5px);
            border: 1px solid #333;
        }
        button {
            background-color: #3a3a3a;
            color: white;
            border: 1px solid #555;
            padding: 8px 12px;
            margin: 0 4px;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            transition: 0.2s;
        }
        button:hover {
            background-color: #555;
        }
        /* Khung chứa ảnh */
        .reader-container {
            width: 70%; /* Kích thước mặc định */
            max-width: 1400px;
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 20px;
            margin-bottom: 50px;
            transition: width 0.3s ease-in-out;
        }
        .page {
            width: 100%;
            margin-bottom: 0px; /* Chỉnh thành >0 nếu muốn có khoảng cách giữa các trang */
            display: block;
        }
    </style>
</head>
<body>
    <div class="control-panel">
        <button onclick="zoom(10)">➕ Phóng to</button>
        <button onclick="zoom(-10)">➖ Thu nhỏ</button>
        <button onclick="resetZoom()">🔄 Mặc định</button>
    </div>

    <div class="reader-container" id="reader">
${imagesHtml}
    </div>

    <script>
        let currentWidth = 70; // % chiều rộng ban đầu

        function zoom(amount) {
            currentWidth += amount;
            // Giới hạn thu phóng từ 20% đến 150% màn hình
            if (currentWidth < 20) currentWidth = 20;
            if (currentWidth > 150) currentWidth = 150;
            updateWidth();
        }

        function resetZoom() {
            currentWidth = 70;
            updateWidth();
        }

        function updateWidth() {
            document.getElementById('reader').style.width = currentWidth + '%';
        }
    </script>
</body>
</html>`;

    newZip.file('index.html', htmlContent);
    newZip.file('.nomedia', '');
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
