import re
import json
import httpx
import os
from typing import Dict, Any, Optional

class AbuseGuard:
    """
    Deterministic Safety & Legal Misuse Prevention Guardrail.
    
    Prevents bad actors from exploiting the legal AI assistant to:
    1. Plan, facilitate, or execute criminal acts.
    2. Evade law enforcement, destroy evidence, or obstruct justice.
    3. Conduct cyber attacks, unauthorized hacking, or digital extortion.
    4. Bribe officials, launder money, or forge documents.
    
    Crucially distinguishes between legitimate legal research 
    (e.g., 'What is the penalty for theft under BNS?') and criminal facilitation 
    (e.g., 'How to steal property without getting caught by police?').
    """

    BLOCKED_PATTERNS = [
        # 0. Abuse of Legal Process, Malicious Prosecution & False Implication
        {
            "category": "ABUSE_OF_LEGAL_PROCESS",
            "regex": (
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we)|would\s+(?:i|we))|ways\s+to|can\s+(?:i|we)|help\s+me\s+to|guide\s+me\s+to)\s*"
                r"(?:mis[\s\\/_-]*use|abuse|exploit|manipulate|game|bypass|circumvent|take\s+advantage\s+of)\b.*?"
                r"\b(?:law|laws|statute|statutes|legal\s+system|court|courts|police|fir|section|sections|bns|ipc|crpc|bnss|justice)\b|"
                r"\b(?:mis[\s\\/_-]*use|abuse|exploit|manipulate)\s+(?:of\s+)?(?:the\s+)?(?:law|laws|statute|legal\s+system|court|fir|police|system)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\s*"
                r"(?:file|lodge|register|put|make|use)\b.*?\b(?:false|fake|bogus|fabricated|trumped[\s-]*up)\b.*?"
                r"\b(?:case|cases|fir|complaint|complaints|allegation|allegations|charge|charges|498a|rape|sc\s*st|dowry)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\s*"
                r"(?:frame|trap|falsely\s+implicate|implicate|entrap)\b.*?\b(?:someone|innocent|anyone|person|people|him|her|them|enemy|rival)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\s*"
                r"(?:fabricate|manufacture|fake|forge|plant)\b.*?\b(?:evidence|proof|document|documents|witness|witnesses|testimony|statement)\b"
            ),
            "title": "Abuse of Legal Process & Malicious Prosecution Blocked",
            "statutory_warning": (
                "Under Section 248 of Bharatiya Nyaya Sanhita, 2023 (formerly Section 211 IPC), instituting false criminal proceedings "
                "or falsely charging any person with an offence with intent to cause injury is a severe cognizable offence punishable with "
                "up to 7 years rigorous imprisonment and fine.\n\n"
                "Furthermore, under Section 217 BNS (giving false information to public servant with intent to cause injury) and Section 227 & 229 BNS "
                "(giving or fabricating false evidence and perjury), misleading law enforcement or judicial tribunals carries up to 7 years imprisonment."
            ),
            "lawful_alternative": (
                "If you are a victim seeking protection from false allegations, malicious prosecution, or frivolous complaints, you may inquire about legitimate lawful remedies:\n"
                "1. Quashing of frivolous FIRs under Section 528 BNSS (formerly Section 482 CrPC).\n"
                "2. Summary discharge under Section 250 / 262 BNSS.\n"
                "3. Counter-prosecution of malicious complainants under Section 248 BNS and Section 217 BNS.\n"
                "4. Safeguards against arbitrary arrest under Section 35(3) BNSS (Arnesh Kumar guidelines)."
            )
        },
        # 1. Evasion of law enforcement & Evidence destruction
        {
            "category": "OBSTRUCTION_OF_JUSTICE",
            "regex": (
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(destroy|hide|tamper\s+with|erase|burn|wipe)\b.*?\b(evidence|proof|body|weapon|corpse|cctv|record)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(evade|escape|flee|avoid|dodge|outrun)\b.*?\b(police|arrest|cops|detection|patrol|investigation)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(bribe|pay\s+off|buy\s+off)\b.*?\b(police|judge|officer|magistrate|official|inspector)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(threaten|intimidate|silence|blackmail)\b.*?\b(witness|witnesses|victim|victims)\b"
            ),
            "title": "Unlawful Act / Obstruction of Justice Blocked",
            "statutory_warning": "Under Section 238 and Section 249 of Bharatiya Nyaya Sanhita, 2023, causing disappearance of evidence of offence, giving false information to screen offender, or threatening witnesses constitutes a cognizable criminal offence punishable with rigorous imprisonment."
        },
        # 2. Criminal Facilitation & Violent Crime Planning
        {
            "category": "CRIME_FACILITATION",
            "regex": (
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(commit|execute|carry\s+out|do|plan)\b.*?\b(murder|theft|burglary|robbery|assault|rape|kidnapping|homicide)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(kill|poison|attack|harm|stab|shoot)\b.*?\b(someone|a\s+person|anybody|people|man|woman)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(make|manufacture|build|assemble)\b.*?\b(bomb|explosive|improvised\s+weapon|poison|toxic)\b|"
                r"\bhow\s+to\s+get\s+away\s+with\b.*?\b(murder|crime|theft|fraud)\b"
            ),
            "title": "Criminal Facilitation Request Blocked",
            "statutory_warning": "Under Section 45, 61, and 103 of Bharatiya Nyaya Sanhita, 2023, criminal conspiracy, abetment, and commission of violent acts are severe non-bailable offences. This platform strictly refuses assistance for planning or executing unlawful acts."
        },
        # 3. Cyber Attack & Digital Exploitation Facilitation
        {
            "category": "CYBER_ATTACK_FACILITATION",
            "regex": (
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(hack|crack|breach|infiltrate|compromise)\b.*?\b(into|bank|website|account|database|server|phone|system)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(deploy|spread|make|distribute)\b.*?\b(ransomware|malware|keylogger|trojan|spyware|virus)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(steal|sniff|intercept|harvest)\b.*?\b(passwords|otp|bank\s+details|credit\s+card|credentials)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(ddos|take\s+down|flood)\b.*?\b(website|server|network)\b"
            ),
            "title": "Cybercrime Facilitation Blocked",
            "statutory_warning": "Under Section 43, 66, and 66C/66D of the Information Technology Act, 2000, hacking, identity theft, unauthorized access, and deploying malware are criminal offences punishable with up to 3 years imprisonment and substantial financial liability."
        },
        # 4. Financial Fraud, Forgery & Money Laundering
        {
            "category": "FINANCIAL_FRAUD_AND_FORGERY",
            "regex": (
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(forge|fake|counterfeit)\b.*?\b(aadhaar|pan\s+card|passport|documents|currency|signature|cheque)\b|"
                r"\b(?:how\s+(?:to|can\s+(?:i|we)|do\s+(?:i|we)|could\s+(?:i|we))|ways\s+to|can\s+(?:i|we))\b.*?"
                r"\b(launder|clean)\b.*?\b(black\s+money|dirty\s+money|illicit\s+funds)\b|"
                r"\b(?:how\s+to\s+scam|how\s+can\s+(?:i|we)\s+scam|ways\s+to\s+scam)\b.*?\b(people|buyers|investors|victims)\b"
            ),
            "title": "Financial Fraud & Forgery Blocked",
            "statutory_warning": "Under Section 318, 336, and 340 of Bharatiya Nyaya Sanhita, 2023, forgery of valuable security, identity documents, and criminal cheating are cognizable offences subject to up to 7 years imprisonment."
        },
        # 5. Prompt Injection, Jailbreaking & Platform Exploitation
        {
            "category": "PROMPT_INJECTION_AND_JAILBREAK",
            "regex": (
                r"\b(?:ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions|system\s+prompt|disregard\s+(?:all\s+)?instructions)\b|"
                r"\b(?:you\s+are\s+now\s+(?:dan|unrestricted|free\s+from|a\s+developer|a\s+coder|codebot|chatgpt))\b|"
                r"\b(?:act\s+as\s+(?:dan|chatgpt|an\s+unrestricted\s+ai|a\s+coder|a\s+software\s+engineer))\b|"
                r"\b(?:pretend\s+(?:you\s+have\s+no\s+rules|you\s+are\s+not\s+a\s+lawyer|there\s+are\s+no\s+laws))\b"
            ),
            "title": "Adversarial Prompt Override Blocked",
            "statutory_warning": (
                "This platform operates strictly under the legal and ethical framework of Indian Jurisprudence. "
                "System prompts, boundary firewalls, and statutory guardrails are immutable."
            ),
            "lawful_alternative": (
                "Please submit queries regarding Indian statutory provisions, constitutional protections, "
                "or legitimate courtroom and citizen legal disputes."
            )
        }
    ]

    def check_query(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Scans incoming query against abuse patterns.
        Normalizes variations and obfuscations (e.g. 'mis\\suse' -> 'misuse').
        Returns a structured refusal notice if inappropriate intent is detected,
        or None if the query is legitimate legal research.
        """
        q_raw = query.lower().strip()
        # Handle escape sequence representations like \s, \n, \\
        q_unescaped = re.sub(r'\\s', ' ', q_raw)
        q_clean = re.sub(r'\\+', '', q_unescaped)
        q_normalized = re.sub(r'\s+', ' ', q_clean)
        # Collapse mis-use, mis use, missuse, mis\suse -> misuse
        q_collapsed = re.sub(r'\bmis[\s\\/_-]*s*use\b', 'misuse', q_normalized)

        test_strings = [q_raw, q_unescaped, q_clean, q_normalized, q_collapsed]

        for rule in self.BLOCKED_PATTERNS:
            for s in test_strings:
                if re.search(rule["regex"], s, re.IGNORECASE):
                    return {
                        "is_blocked": True,
                        "category": rule["category"],
                        "title": rule["title"],
                        "reason": (
                            "This query has been intercepted and blocked by the Bharat Legal Intelligence "
                            "Safety & Anti-Misuse Guardrail. The platform strictly prohibits assisting in "
                            "planning, facilitating, or evading consequences of unlawful conduct, malicious prosecution, "
                            "or abuse of judicial processes."
                        ),
                        "statutory_warning": rule["statutory_warning"],
                        "lawful_alternative": rule.get("lawful_alternative") or (
                            "If you are seeking legal representation, procedural safeguards, or defense rights, "
                            "please formulate your inquiry around constitutional protections (e.g., Article 22 "
                            "safeguards upon arrest) or consult an authorized advocate."
                        )
                    }

        return None

    def check_query_ai(self, query: str, api_key: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Layer 2: Google Gemini Semantic AI Intent Judge.
        Uses Google Gemini to semantically evaluate complex, indirect, hypothetical,
        fictional, or multilingual phrasing for unlawful intent.
        
        Preserves 100% lawful defense research (e.g. remedies against false complaints).
        """
        if not api_key:
            return None

        system_instruction = (
            "You are the Supreme Judicial Safety & Legal Intent Judge for 'भारत Legal Intelligence' "
            "(an AI platform providing Indian legal assistance under Bharatiya Nyaya Sanhita 2023, "
            "BNSS 2023, BSA 2023, and the Constitution of India).\n\n"
            "Your sole responsibility is to evaluate user queries for malicious intent, illegal facilitation, "
            "abuse of legal process, and criminal exploitation.\n\n"
            "EVALUATION CRITERIA:\n"
            "1. BLOCK IF (Malicious / Unlawful Intent):\n"
            "   - The user is asking how to misuse, game, manipulate, or weaponize laws or courts against someone.\n"
            "   - The user is asking how to file false, fake, or fabricated FIRs, complaints, or charges (e.g., false 498A, false rape, false SC/ST act complaints).\n"
            "   - The user is asking how to frame, trap, or falsely implicate an innocent person or rival.\n"
            "   - The user is asking how to destroy, tamper with, or conceal evidence, or evade police/investigation.\n"
            "   - The user is asking how to bribe, threaten, or intimidate witnesses or officials.\n"
            "   - The user is asking how to commit crimes (violence, theft, fraud, forgery, money laundering, cyber attacks) or evade punishment.\n"
            "   - Any hypothetical, fictional, roleplay, or disguised phrasing designed to obtain illegal/unethical blueprints.\n\n"
            "2. ALLOW IF (Legitimate Legal Research & Defense - MUST NOT BLOCK):\n"
            "   - The user is asking about defense rights, protection, or remedies against false complaints (e.g. 'How to defend against a false FIR?', 'How to quash a frivolous complaint under Sec 528 BNSS?').\n"
            "   - The user is asking about the statutory definition, penalty, ingredients, or Supreme Court judgments regarding an offense (e.g. 'What is the penalty for filing a false case under Sec 248 BNS?').\n"
            "   - The user is asking about arrest safeguards, bail rights, NALSA legal aid, police misconduct remedies, or constitutional rights.\n\n"
            "OUTPUT FORMAT:\n"
            "Return strictly a valid JSON object:\n"
            "{\n"
            '  "is_safe": true,\n'
            '  "category": "NONE",\n'
            '  "title": "",\n'
            '  "reason": "",\n'
            '  "statutory_warning": "",\n'
            '  "lawful_alternative": ""\n'
            "}\n"
            "or if unsafe:\n"
            "{\n"
            '  "is_safe": false,\n'
            '  "category": "ABUSE_OF_LEGAL_PROCESS",\n'
            '  "title": "Short Title for Block",\n'
            '  "reason": "Specific reason why this violates legal ethics",\n'
            '  "statutory_warning": "Statutory warning citing relevant BNS/BNSS/IT Act provisions",\n'
            '  "lawful_alternative": "Constructive, lawful alternative or defense remedy"\n'
            "}"
        )

        models_to_try = ["gemini-flash-lite-latest", "gemini-3.8-flash", "gemini-flash-latest"]
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\nUSER QUERY TO EVALUATE:\n\"{query}\""}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.0,
                "maxOutputTokens": 512,
                "responseMimeType": "application/json"
            }
        }

        for model_name in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            try:
                with httpx.Client(timeout=4.0) as client:
                    resp = client.post(url, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts:
                                text = parts[0].get("text", "").strip()
                                parsed = json.loads(text)
                                if not parsed.get("is_safe", True):
                                    return {
                                        "is_blocked": True,
                                        "category": parsed.get("category", "ABUSE_OF_LEGAL_PROCESS"),
                                        "title": parsed.get("title") or "Malicious Intent / Legal Process Abuse Blocked",
                                        "reason": parsed.get("reason") or (
                                            "This inquiry was evaluated by the Google Gemini Safety & Intent Judge and determined "
                                            "to facilitate unlawful conduct, malicious prosecution, or abuse of legal procedures."
                                        ),
                                        "statutory_warning": parsed.get("statutory_warning") or (
                                            "Under Section 248 of Bharatiya Nyaya Sanhita, 2023, instituting false criminal proceedings "
                                            "is punishable with up to 7 years imprisonment."
                                        ),
                                        "lawful_alternative": parsed.get("lawful_alternative") or (
                                            "If you are seeking defense remedies or procedural protection, you may inquire about "
                                            "safeguards under Section 528 BNSS or constitutional rights under Article 22."
                                        )
                                    }
                                return None  # Confirmed safe by AI Judge
                    elif resp.status_code == 429:
                        # Quota exceeded on this model, cascade to next model
                        continue
            except Exception:
                continue

        # Fail-safe: if AI check fails or times out, return None (Layer 1 already checked blatant patterns)
        return None
