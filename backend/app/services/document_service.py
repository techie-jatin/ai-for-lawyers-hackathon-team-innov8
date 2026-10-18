"""
Bharat Legal Intelligence 2.0 - Universal Document Extraction Service
Extracts verbatim legal text and structured metadata (FIR number, Police Station, applicable sections)
from digital and scanned PDFs, DOCX contracts, plain text, and evidentiary images.
Integrates pypdf, docx2txt, and Gemini Flash Vision OCR.
"""

from typing import Dict, Any, Optional
import io
import base64
import os
import tempfile
import pypdf
import docx2txt
from app.services.ocr_service import LegalOcrService


class LegalDocumentService:
    @staticmethod
    def extract_document(
        file_base64: str,
        file_name: str = "document.pdf",
        mime_type: Optional[str] = None,
        gemini_api_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Master document parser and text extractor.
        Accepts base64 encoded document bytes and extracts clean text and metadata.
        """
        if not file_base64:
            return {
                "file_name": file_name,
                "text": "",
                "extracted_text": "",
                "word_count": 0,
                "character_count": 0,
                "is_scanned": False,
                "metadata": {},
                "success": False,
                "error": "Empty file payload provided."
            }

        # 1. Strip data URL scheme prefix if present
        clean_b64 = file_base64
        if "," in clean_b64:
            clean_b64 = clean_b64.split(",", 1)[1]

        try:
            file_bytes = base64.b64decode(clean_b64)
        except Exception as e:
            return {
                "file_name": file_name,
                "text": "",
                "extracted_text": "",
                "word_count": 0,
                "character_count": 0,
                "is_scanned": False,
                "metadata": {},
                "success": False,
                "error": f"Invalid base64 payload: {str(e)}"
            }

        ext = file_name.split(".")[-1].lower() if "." in file_name else ""
        extracted_text = ""
        metadata: Dict[str, Any] = {}
        is_scanned = False
        warning = None

        # 2. Text-based files (.txt, .md, .csv, .json, .rtf)
        if ext in ["txt", "md", "csv", "json", "rtf"] or (mime_type and "text/" in mime_type):
            try:
                extracted_text = file_bytes.decode("utf-8")
            except UnicodeDecodeError:
                extracted_text = file_bytes.decode("latin1", errors="ignore")

        # 3. PDF Files (.pdf)
        elif ext == "pdf" or (mime_type and "pdf" in mime_type):
            try:
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                pages_text = []
                for idx, page in enumerate(reader.pages):
                    t = page.extract_text() or ""
                    if t.strip():
                        pages_text.append(t.strip())
                extracted_text = "\n\n".join(pages_text).strip()

                # If digital text extraction is empty or very short (< 35 chars),
                # it's a scanned photocopy/seal; dispatch to Gemini 1.5 Flash Vision OCR
                if len(extracted_text) < 35:
                    is_scanned = True
                    ocr_res = LegalOcrService.process_document_image(
                        file_base64=clean_b64,
                        mime_type="application/pdf",
                        file_name=file_name,
                        gemini_api_key=gemini_api_key
                    )
                    extracted_text = ocr_res.get("extracted_text") or ocr_res.get("text") or ""
                    metadata = ocr_res.get("metadata") or {}
            except Exception as e:
                # PDF parsing exception; fallback to OCR
                is_scanned = True
                ocr_res = LegalOcrService.process_document_image(
                    file_base64=clean_b64,
                    mime_type="application/pdf",
                    file_name=file_name,
                    gemini_api_key=gemini_api_key
                )
                extracted_text = ocr_res.get("extracted_text") or ocr_res.get("text") or ""
                metadata = ocr_res.get("metadata") or {}

        # 4. DOCX Files (.docx, .doc)
        elif ext in ["docx", "doc"] or (mime_type and "word" in mime_type):
            tmp_path = None
            try:
                with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
                    tmp.write(file_bytes)
                    tmp_path = tmp.name
                extracted_text = docx2txt.process(tmp_path)
            except Exception as e:
                extracted_text = ""
                warning = f"Failed to extract DOCX: {str(e)}"
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except Exception:
                        pass

        # 5. Image Files (PNG, JPG, JPEG, WEBP, BMP, TIFF)
        elif ext in ["png", "jpg", "jpeg", "webp", "bmp", "tiff"] or (mime_type and "image/" in mime_type):
            is_scanned = True
            ocr_res = LegalOcrService.process_document_image(
                file_base64=clean_b64,
                mime_type=mime_type or "image/png",
                file_name=file_name,
                gemini_api_key=gemini_api_key
            )
            extracted_text = ocr_res.get("extracted_text") or ocr_res.get("text") or ""
            metadata = ocr_res.get("metadata") or {}

        # 6. Fallback generic text decoding
        else:
            try:
                extracted_text = file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                extracted_text = ""

        # Normalize and clean output
        extracted_text = extracted_text.replace("\r\n", "\n").strip()
        word_count = len(extracted_text.split()) if extracted_text else 0

        # Heuristic FIR/statutory metadata extraction if not already provided
        if not metadata and extracted_text:
            metadata = LegalOcrService.extract_fir_metadata(extracted_text)

        return {
            "file_name": file_name,
            "text": extracted_text,
            "extracted_text": extracted_text,
            "word_count": word_count,
            "character_count": len(extracted_text),
            "is_scanned": is_scanned,
            "metadata": metadata,
            "fir_metadata": metadata,
            "success": bool(extracted_text and len(extracted_text) > 5),
            "warning": warning
        }
