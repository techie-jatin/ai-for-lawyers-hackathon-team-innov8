/**
 * Bharat Legal Intelligence - High-Fidelity Client-Side Document Parser
 * Parses and extracts clean, uncorrupted text from legal PDFs, DOCX agreements,
 * FIR copies, and plain text files directly in the browser with zero external dependencies.
 */

export interface FirOcrMetadata {
  police_station?: string;
  fir_number?: string;
  date?: string;
  district?: string;
  acts?: string[];
  sections?: string[];
  complainant?: string;
  accused?: string[];
  raw_entities?: Record<string, string>;
  language_detected?: string;
  ocr_confidence?: number;
}

export interface ParsedDocumentResult {
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'docx' | 'txt' | 'image' | 'other';
  formattedSize: string;
  text: string;
  wordCount: number;
  characterCount: number;
  isTruncated: boolean;
  isScannedOrEmpty: boolean;
  warning?: string;
  ocrMetadata?: FirOcrMetadata;
}

const MAX_EXTRACTED_CHARS = 24000; // ~3,800 to 4,200 legal words

/**
 * Format bytes into human-readable string (KB/MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Decode PDF text literals, handling escapes like \(, \), \\, \r, \n, \t
 */
function decodePdfLiteral(raw: string): string {
  return raw
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\([0-7]{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

/**
 * Extract text from PDF content stream (BT ... ET blocks, Tj and TJ operators)
 */
function extractTextFromPdfStream(streamContent: string): string {
  const extractedLines: string[] = [];
  const btEtRegex = /BT([\s\S]*?)ET/g;
  let match: RegExpExecArray | null;

  while ((match = btEtRegex.exec(streamContent)) !== null) {
    const textBlock = match[1];
    const tjRegex = /(?:(\((?:[^()\\]|\\.)*\))\s*Tj|\[((?:[^\[\]\\]|\\.)*)\]\s*TJ)/g;
    let tjMatch: RegExpExecArray | null;
    const blockPieces: string[] = [];

    while ((tjMatch = tjRegex.exec(textBlock)) !== null) {
      if (tjMatch[1]) {
        // Simple Tj string: (Text) Tj
        const rawString = tjMatch[1].slice(1, -1);
        blockPieces.push(decodePdfLiteral(rawString));
      } else if (tjMatch[2]) {
        // TJ array: [(T) 20 (ext)] TJ
        const arrayContent = tjMatch[2];
        const stringInArrayRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)/g;
        let strMatch: RegExpExecArray | null;
        while ((strMatch = stringInArrayRegex.exec(arrayContent)) !== null) {
          blockPieces.push(decodePdfLiteral(strMatch[1]));
        }
      }
    }

    if (blockPieces.length > 0) {
      extractedLines.push(blockPieces.join(''));
    }
  }

  // Fallback: If no standard BT/ET blocks matched (e.g. raw text objects in simple PDFs)
  if (extractedLines.length === 0) {
    const rawTj = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*Tj/g;
    let fallbackMatch: RegExpExecArray | null;
    while ((fallbackMatch = rawTj.exec(streamContent)) !== null) {
      extractedLines.push(decodePdfLiteral(fallbackMatch[1]));
    }
  }

  return extractedLines.join('\n');
}

/**
 * Decompress a Uint8Array using browser native DecompressionStream if supported
 */
async function decompressDeflateStream(data: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') {
    return '';
  }

  // Try 'deflate' first, then 'deflate-raw'
  const formats: ('deflate' | 'deflate-raw')[] = ['deflate', 'deflate-raw'];
  for (const format of formats) {
    try {
      const ds = new DecompressionStream(format);
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();

      writer.write(data as unknown as BufferSource);
      writer.close();

      const chunks: Uint8Array[] = [];
      let totalLength = 0;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          totalLength += value.length;
          if (totalLength > 10 * 1024 * 1024) break; // Guard against zip-bombs
        }
      }

      const combined = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      return new TextDecoder('utf-8', { fatal: false }).decode(combined);
    } catch {
      // Try next format
    }
  }

  return '';
}

/**
 * Client-Side PDF Text Extractor
 * Reads binary PDF ArrayBuffer, locates and decompresses text streams, and extracts clean text.
 */
async function parsePdfArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('latin1'); // Use latin1 to safely scan byte markers
  const rawString = textDecoder.decode(bytes);

  const collectedTextPieces: string[] = [];

  // Track stream positions in the raw bytes for binary slicing
  const streamByteIndices: Array<{ start: number; end: number; isFlate: boolean }> = [];

  // Simple scan for Flate streams vs plain streams
  let searchPos = 0;
  while ((searchPos = rawString.indexOf('stream', searchPos)) !== -1) {
    // Find preceding dictionary to check filter
    const dictStart = rawString.lastIndexOf('<<', searchPos);
    let isFlate = false;
    if (dictStart !== -1 && dictStart > searchPos - 250) {
      const dict = rawString.substring(dictStart, searchPos);
      if (dict.includes('FlateDecode')) {
        isFlate = true;
      }
    }

    // Advance past 'stream\r\n' or 'stream\n'
    let dataStart = searchPos + 6;
    if (bytes[dataStart] === 13 && bytes[dataStart + 1] === 10) {
      dataStart += 2;
    } else if (bytes[dataStart] === 10) {
      dataStart += 1;
    }

    const endPos = rawString.indexOf('endstream', dataStart);
    if (endPos !== -1) {
      streamByteIndices.push({
        start: dataStart,
        end: endPos,
        isFlate
      });
      searchPos = endPos + 9;
    } else {
      break;
    }
  }

  // Process extracted streams
  for (const info of streamByteIndices) {
    if (info.end <= info.start) continue;

    if (info.isFlate) {
      const compressedChunk = bytes.subarray(info.start, info.end);
      try {
        const decompressed = await decompressDeflateStream(compressedChunk);
        if (decompressed && (decompressed.includes('BT') || decompressed.includes('Tj') || decompressed.includes('TJ'))) {
          const text = extractTextFromPdfStream(decompressed);
          if (text.trim()) {
            collectedTextPieces.push(text.trim());
          }
        }
      } catch {
        // Skip corrupted stream
      }
    } else {
      // Uncompressed stream
      const sliceString = rawString.substring(info.start, info.end);
      if (sliceString.includes('BT') || sliceString.includes('Tj') || sliceString.includes('TJ')) {
        const text = extractTextFromPdfStream(sliceString);
        if (text.trim()) {
          collectedTextPieces.push(text.trim());
        }
      }
    }

    if (collectedTextPieces.join('\n').length >= MAX_EXTRACTED_CHARS) {
      break;
    }
  }

  // 2. Direct string literal fallback across whole document if stream parser found nothing
  if (collectedTextPieces.length === 0) {
    const rawTj = extractTextFromPdfStream(rawString);
    if (rawTj.trim()) {
      collectedTextPieces.push(rawTj.trim());
    }
  }

  return collectedTextPieces.join('\n\n');
}

/**
 * Client-Side DOCX Parser
 * Unpacks the PKZIP archive, decompresses word/document.xml, and extracts text paragraphs.
 */
async function parseDocxArrayBuffer(buffer: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buffer);
  const textDecoder = new TextDecoder('latin1');
  const rawString = textDecoder.decode(bytes);

  // Look for the local file header containing word/document.xml
  const targetFile = 'word/document.xml';
  const targetIndex = rawString.indexOf(targetFile);
  if (targetIndex === -1) {
    return '';
  }

  // Trace back to local file header signature: PK\x03\x04
  const headerSig = rawString.lastIndexOf('PK\x03\x04', targetIndex);
  if (headerSig === -1) {
    return '';
  }

  const view = new DataView(buffer);
  const compressionMethod = view.getUint16(headerSig + 8, true);
  const compressedSize = view.getUint32(headerSig + 18, true);
  const fileNameLen = view.getUint16(headerSig + 26, true);
  const extraLen = view.getUint16(headerSig + 28, true);

  const fileDataStart = headerSig + 30 + fileNameLen + extraLen;
  const fileDataEnd = fileDataStart + compressedSize;

  if (fileDataEnd > bytes.length) {
    return '';
  }

  const fileData = bytes.subarray(fileDataStart, fileDataEnd);

  let xmlContent = '';
  if (compressionMethod === 0) {
    xmlContent = new TextDecoder('utf-8').decode(fileData);
  } else if (compressionMethod === 8) {
    xmlContent = await decompressDeflateStream(fileData);
  }

  if (!xmlContent) {
    return '';
  }

  // Extract text from <w:p> paragraphs and <w:t> tags
  const paragraphs: string[] = [];
  const pRegex = /<w:p\b[^>]*>([\s\S]*?)<\/w:p>/g;
  let pMatch: RegExpExecArray | null;

  while ((pMatch = pRegex.exec(xmlContent)) !== null) {
    const pContent = pMatch[1];
    const tRegex = /<w:t\b[^>]*>([^<]*)<\/w:t>/g;
    let tMatch: RegExpExecArray | null;
    const runTexts: string[] = [];

    while ((tMatch = tRegex.exec(pContent)) !== null) {
      if (tMatch[1]) {
        runTexts.push(tMatch[1]);
      }
    }

    if (runTexts.length > 0) {
      paragraphs.push(runTexts.join(''));
    }
  }

  return paragraphs.join('\n');
}

/**
 * Convert a File or Blob into base64 string
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Call the backend Bilingual OCR Engine (Gemini 1.5 Vision Multimodal)
 */
export async function performDocumentOcr(
  file: File,
  apiBase: string = 'http://localhost:8000',
  languageHint: string = 'en,hi'
): Promise<{
  text: string;
  wordCount: number;
  confidence: number;
  firMetadata?: FirOcrMetadata;
  languageDetected?: string;
  success: boolean;
  error?: string;
}> {
  try {
    const base64Data = await fileToBase64(file);
    const cleanBase = (apiBase || 'http://localhost:8000').replace(/\/+$/, '');
    const targets = [
      `${cleanBase}/api/assistant/ocr`,
      cleanBase.includes('localhost')
        ? `${cleanBase.replace('localhost', '127.0.0.1')}/api/assistant/ocr`
        : null
    ].filter(Boolean) as string[];

    let lastError = '';
    for (const targetUrl of targets) {
      try {
        const resp = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_base64: base64Data,
            mime_type: file.type || 'image/jpeg',
            file_name: file.name,
            filename: file.name,
            language_hint: languageHint
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const text = data.extracted_text || data.text || '';
          const metadata = data.metadata || data.fir_metadata;
          return {
            text,
            wordCount: data.word_count || (text ? text.split(/\s+/).filter(Boolean).length : 0),
            confidence: data.confidence || 0.9,
            firMetadata: metadata,
            languageDetected: data.language_detected,
            success: Boolean(text && text.trim().length > 0)
          };
        } else {
          lastError = `OCR HTTP ${resp.status}: ${resp.statusText}`;
        }
      } catch (err: any) {
        lastError = err?.message || 'Network error during OCR request';
      }
    }

    return {
      text: '',
      wordCount: 0,
      confidence: 0,
      success: false,
      error: lastError || 'Failed to reach OCR endpoint'
    };
  } catch (err: any) {
    return {
      text: '',
      wordCount: 0,
      confidence: 0,
      success: false,
      error: err?.message || 'Failed to encode document for OCR'
    };
  }
}

/**
 * Master Document Ingestion Function
 * Ingests any uploaded File object (.pdf, .docx, .txt, .png, .jpg, .jpeg, .webp, .bmp)
 * and extracts clean, normalized text suitable for statutory RAG analysis.
 * Uses robust server-side extraction (pypdf, docx2txt, Gemini OCR) with seamless client fallback.
 */
export async function parseUploadedDocument(
  file: File,
  apiBase: string = 'http://localhost:8000'
): Promise<ParsedDocumentResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  let fileType: 'pdf' | 'docx' | 'txt' | 'image' | 'other' = 'other';
  if (extension === 'pdf') fileType = 'pdf';
  else if (extension === 'docx' || extension === 'doc') fileType = 'docx';
  else if (['txt', 'rtf', 'md', 'csv', 'json'].includes(extension)) fileType = 'txt';
  else if (['png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'].includes(extension)) fileType = 'image';

  // 1. Guard against oversized files (> 15MB)
  if (file.size > 15 * 1024 * 1024) {
    return {
      fileName: file.name,
      fileSize: file.size,
      fileType,
      formattedSize: formatFileSize(file.size),
      text: '',
      wordCount: 0,
      characterCount: 0,
      isTruncated: false,
      isScannedOrEmpty: true,
      warning: 'File size exceeds 15 MB limit. Please upload a smaller legal brief or excerpt.'
    };
  }

  // 2. Primary Pipeline: High-Fidelity Server-Side Extraction (/api/assistant/extract-document)
  try {
    const base64Data = await fileToBase64(file);
    const cleanBase = (apiBase || 'http://localhost:8000').replace(/\/+$/, '');
    const targets = [
      `${cleanBase}/api/assistant/extract-document`,
      cleanBase.includes('localhost')
        ? `${cleanBase.replace('localhost', '127.0.0.1')}/api/assistant/extract-document`
        : null
    ].filter(Boolean) as string[];

    for (const targetUrl of targets) {
      try {
        const resp = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file_base64: base64Data,
            file_name: file.name,
            filename: file.name,
            mime_type: file.type || undefined
          })
        });

        if (resp.ok) {
          const data = await resp.json();
          const serverText = (data.text || data.extracted_text || '').trim();
          if (data.success && serverText.length > 10) {
            let processedText = serverText;
            let isTruncated = false;
            if (processedText.length > MAX_EXTRACTED_CHARS) {
              processedText = processedText.slice(0, MAX_EXTRACTED_CHARS) + '\n\n... [Document context optimized: first ~4,000 words captured for statutory research]';
              isTruncated = true;
            }
            return {
              fileName: file.name,
              fileSize: file.size,
              fileType,
              formattedSize: formatFileSize(file.size),
              text: processedText,
              wordCount: data.word_count || processedText.split(/\s+/).filter(Boolean).length,
              characterCount: processedText.length,
              isTruncated,
              isScannedOrEmpty: false,
              warning: data.warning,
              ocrMetadata: data.metadata || data.fir_metadata
            };
          }
        }
      } catch {
        // Try next endpoint candidate or fall through to client fallback
      }
    }
  } catch {
    // Fall back to client-side parsing
  }

  // 3. Fallback Pipeline: In-Browser Client Parsing
  let extractedText = '';
  let ocrMetadata: FirOcrMetadata | undefined;

  try {
    if (fileType === 'image') {
      // Direct Bilingual OCR via Gemini 1.5 Vision Multimodal Engine
      const ocrResult = await performDocumentOcr(file, apiBase);
      if (ocrResult.success && ocrResult.text.trim()) {
        extractedText = ocrResult.text;
        ocrMetadata = ocrResult.firMetadata;
      } else {
        return {
          fileName: file.name,
          fileSize: file.size,
          fileType,
          formattedSize: formatFileSize(file.size),
          text: '',
          wordCount: 0,
          characterCount: 0,
          isTruncated: false,
          isScannedOrEmpty: true,
          warning: ocrResult.error || 'Unable to recognize text in image. Please ensure image is well-lit and legible.'
        };
      }
    } else if (fileType === 'txt') {
      // Plain text reader
      extractedText = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file, 'UTF-8');
      });
    } else if (fileType === 'pdf') {
      // PDF Binary ArrayBuffer parsing
      const buffer = await file.arrayBuffer();
      extractedText = await parsePdfArrayBuffer(buffer);

      // If client-side PDF stream extraction found < 20 chars, it's a scanned photocopy/seal
      if (extractedText.trim().length < 20) {
        const ocrResult = await performDocumentOcr(file, apiBase);
        if (ocrResult.success && ocrResult.text.trim()) {
          extractedText = ocrResult.text;
          ocrMetadata = ocrResult.firMetadata;
        }
      }
    } else if (fileType === 'docx') {
      // DOCX Zip XML parsing
      const buffer = await file.arrayBuffer();
      extractedText = await parseDocxArrayBuffer(buffer);
    } else {
      // Unsupported or generic fallback
      extractedText = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsText(file, 'UTF-8');
      });
    }
  } catch (err: any) {
    console.error('Document parsing exception:', err);
    extractedText = '';
  }

  // Normalize whitespace & linebreaks
  extractedText = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const isScannedOrEmpty = extractedText.length < 20;
  let isTruncated = false;
  let warning: string | undefined;

  if (isScannedOrEmpty) {
    if (fileType === 'pdf') {
      warning = 'No selectable digital text layer found. Scanned photocopy detected; please verify backend OCR connectivity or paste the operative clauses.';
    } else if (fileType === 'image') {
      warning = 'Image contains no legible legal text or sections.';
    } else {
      warning = 'Uploaded file contains no readable text content.';
    }
  } else if (extractedText.length > MAX_EXTRACTED_CHARS) {
    extractedText = extractedText.slice(0, MAX_EXTRACTED_CHARS) + '\n\n... [Document context optimized: first ~4,000 words captured for statutory research]';
    isTruncated = true;
  }

  const wordCount = extractedText ? extractedText.split(/\s+/).filter(Boolean).length : 0;

  return {
    fileName: file.name,
    fileSize: file.size,
    fileType,
    formattedSize: formatFileSize(file.size),
    text: extractedText,
    wordCount,
    characterCount: extractedText.length,
    isTruncated,
    isScannedOrEmpty,
    warning,
    ocrMetadata
  };
}
