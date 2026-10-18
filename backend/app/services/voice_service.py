"""
Bharat Legal Intelligence 2.0 - Bilingual Voice Consultation Service
Provides audio transcription (Groq Whisper v3 / Gemini Flash Audio) and spoken
speech briefing optimization (stripping markdown syntax, formatting legal symbols for TTS,
and generating natural spoken English & Hindi summaries).
"""

from typing import Dict, Any, Optional
import json
import re
import base64
import urllib.request
import urllib.error
from app.core.config import settings

class LegalVoiceService:
    @staticmethod
    def clean_text_for_speech(raw_text: str) -> str:
        """
        Cleans markdown formatting, citations, URLs, tables, and special legal symbols
        into smooth, phonetically natural sentences suitable for Web Speech synthesis.
        """
        if not raw_text:
            return ""

        text = raw_text

        # Remove code blocks
        text = re.sub(r"```[\s\S]*?```", "", text)
        text = re.sub(r"`([^`]+)`", r"\1", text)

        # Remove markdown tables (| Col 1 | Col 2 |)
        text = re.sub(r"\|[^\n]+\|", "", text)

        # Remove URLs
        text = re.sub(r"https?://\S+", "", text)

        # Remove markdown links [Text](url) -> Text
        text = re.sub(r"\[([^\]]+)\]\([^\)]+\)", r"\1", text)

        # Format legal abbreviations for clean pronunciation
        text = re.sub(r"\b[uU]/[sS]\b", "under section", text)
        text = re.sub(r"§\s*([0-9]+)", r"section \1", text)
        text = re.sub(r"\bv\.\s+|\bvs\.\s+", "versus ", text, flags=re.IGNORECASE)
        text = re.sub(r"\bCrPC\b", "C R P C", text)
        text = re.sub(r"\bCPC\b", "C P C", text)
        text = re.sub(r"\bBNSS\b", "B N S S", text)
        text = re.sub(r"\bBNS\b", "B N S", text)
        text = re.sub(r"\bBSA\b", "B S A", text)
        text = re.sub(r"\bFIR\b", "F I R", text)
        text = re.sub(r"\bCPA\b", "Consumer Protection Act", text)
        text = re.sub(r"\bICA\b", "Indian Contract Act", text)
        text = re.sub(r"(?:₹|\bINR\b|\bRs\.?)\s*", "Rupees ", text)

        # Remove markdown headers and list bullets
        text = re.sub(r"^[#\*\-]+\s*", "", text, flags=re.MULTILINE)
        text = re.sub(r"[*_~`>]", "", text)

        # Remove neutral citations like [2023] INSC 1066
        text = re.sub(r"\[\d{4}\]\s*INSC\s*\d+", "", text)

        # Collapse whitespace and newlines
        text = re.sub(r"\n+", ". ", text)
        text = re.sub(r"\s+", " ", text).strip()

        # Limit to ~150 words for an ideal 45-60 second spoken briefing
        words = text.split()
        if len(words) > 160:
            text = " ".join(words[:160]) + "..."

        return text

    @staticmethod
    def generate_bilingual_briefing(text: str) -> Dict[str, str]:
        """
        Synthesizes both an English spoken briefing and a Hindi conversational advisory
        from a legal answer or case facts.
        """
        english_clean = LegalVoiceService.clean_text_for_speech(text)

        # Generate phonetic Hindi guidance based on core detected statutory provisions
        lower_text = text.lower()
        hindi_summary_parts = ["नमस्ते। आपके मामले में मुख्य कानूनी स्थिति इस प्रकार है:"]

        if "318" in lower_text or "cheat" in lower_text or "420" in lower_text:
            hindi_summary_parts.append(
                "धोखाधड़ी के मामले में भारतीय न्याय संहिता की धारा 318(4) लागू होती है। "
                "यदि गिरफ्तारी की आशंका है, तो पुलिस को धारा 35 बीएनएसएस के तहत नोटिस देना अनिवार्य है।"
            )
        elif "138" in lower_text or "cheque" in lower_text or "dishonour" in lower_text:
            hindi_summary_parts.append(
                "चेक बाउंस के मामले में नेगोशिएबल इंस्ट्रूमेंट्स एक्ट की धारा 138 के तहत "
                "मेमो प्राप्त होने के 30 दिनों के भीतर कानूनी नोटिस भेजना आवश्यक है।"
            )
        elif "deposit" in lower_text or "hostel" in lower_text or "rent" in lower_text:
            hindi_summary_parts.append(
                "हॉस्टल या मकान के सिक्योरिटी डिपॉजिट की अवैध जब्ती अनुबंध अधिनियम की धारा 74 "
                "और उपभोक्ता संरक्षण अधिनियम के तहत अवैध है। आप तत्काल ई-दाखिल पर शिकायत कर सकते हैं।"
            )
        elif "quash" in lower_text or "528" in lower_text or "482" in lower_text:
            hindi_summary_parts.append(
                "फर्जी या दुर्भावनापूर्ण एफआईआर को रद्द कराने के लिए उच्च न्यायालय में धारा 528 बीएनएसएस "
                "के तहत याचिका दायर की जा सकती है।"
            )
        else:
            hindi_summary_parts.append(
                "आपके कानूनी अधिकार सुरक्षित हैं। किसी भी दबाव में बिना कानूनी सलाह के कोई बयान न दें, "
                "और साक्ष्यों को सुरक्षित रखें।"
            )

        hindi_summary_parts.append("विस्तृत कानूनी दस्तावेज और कदम नीचे चैट में उपलब्ध हैं।")
        hindi_clean = " ".join(hindi_summary_parts)

        return {
            "spoken_english": english_clean,
            "spoken_hindi": hindi_clean
        }

    @staticmethod
    def transcribe_audio_base64(
        audio_base64: str,
        mime_type: str = "audio/webm",
        language: str = "auto"
    ) -> Dict[str, Any]:
        """
        Transcribes audio bytes using Groq Whisper API (primary) or Gemini Flash Audio (secondary).
        """
        clean_base64 = audio_base64
        if "," in audio_base64:
            clean_base64 = audio_base64.split(",")[1]

        # 1. Try Groq Whisper API if GROQ_API_KEY is configured
        if settings.GROQ_API_KEY:
            try:
                raw_bytes = base64.b64decode(clean_base64)
                boundary = "----BharatVoiceBoundary12345"
                filename = "audio.webm" if "webm" in mime_type else "audio.wav"

                # Construct multipart/form-data
                body = bytearray()
                # model field
                body.extend(f"--{boundary}\r\n".encode("utf-8"))
                body.extend(b'Content-Disposition: form-data; name="model"\r\n\r\n')
                body.extend(b"whisper-large-v3\r\n")

                # language field
                if language in ("en", "hi"):
                    body.extend(f"--{boundary}\r\n".encode("utf-8"))
                    body.extend(f'Content-Disposition: form-data; name="language"\r\n\r\n{language}\r\n'.encode("utf-8"))

                # file field
                body.extend(f"--{boundary}\r\n".encode("utf-8"))
                body.extend(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode("utf-8"))
                body.extend(f"Content-Type: {mime_type}\r\n\r\n".encode("utf-8"))
                body.extend(raw_bytes)
                body.extend(f"\r\n--{boundary}--\r\n".encode("utf-8"))

                req = urllib.request.Request(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    data=bytes(body),
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                        "Content-Type": f"multipart/form-data; boundary={boundary}"
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=15) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    text = data.get("text", "").strip()
                    if text:
                        detected_lang = "Hindi" if any("\u0900" <= c <= "\u097F" for c in text) else "English"
                        return {
                            "text": text,
                            "language": detected_lang,
                            "provider": "Groq Whisper Large v3",
                            "confidence": 0.98,
                            "success": True
                        }
            except Exception as e:
                # Groq failed; continue to Gemini fallback
                pass

        # 2. Try Gemini 1.5 Multimodal Audio if GEMINI_API_KEY is configured
        if settings.GEMINI_API_KEY:
            try:
                payload = {
                    "contents": [{
                        "parts": [
                            {
                                "inline_data": {
                                    "mime_type": mime_type if "/" in mime_type else "audio/webm",
                                    "data": clean_base64
                                }
                            },
                            {
                                "text": (
                                    "You are an Indian legal voice transcription assistant. Transcribe the spoken audio "
                                    "verbatim in English, Hindi, or Hinglish as spoken. Return ONLY the transcribed text "
                                    "with zero added explanations."
                                )
                            }
                        ]
                    }],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 1024
                    }
                }

                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"},
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=settings.LLM_REQUEST_TIMEOUT_SECONDS) as resp:
                    res_data = json.loads(resp.read().decode("utf-8"))
                    candidates = res_data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        text = "".join([p.get("text", "") for p in parts]).strip()
                        if text:
                            detected_lang = "Hindi" if any("\u0900" <= c <= "\u097F" for c in text) else "English"
                            return {
                                "text": text,
                                "language": detected_lang,
                                "provider": "Gemini 1.5 Flash Audio",
                                "confidence": 0.95,
                                "success": True
                            }
            except Exception:
                pass

        # 3. Fallback when keys unavailable or network error
        return {
            "text": "",
            "language": language,
            "provider": "None (Offline / Browser Speech Fallback)",
            "confidence": 0.0,
            "success": False,
            "message": "Cloud transcription is offline. Web Speech API browser dictation active."
        }
