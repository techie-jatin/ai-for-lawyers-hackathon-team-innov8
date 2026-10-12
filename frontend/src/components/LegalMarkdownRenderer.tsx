import React from 'react';

interface InlineToken {
  type: 'text' | 'bold' | 'italic' | 'code' | 'citation';
  content: string;
}

/**
 * Tokenize inline Markdown formatting and highlight key Indian statutory citations.
 */
function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  
  // Regex to detect bold (**...**), italic (*...*), code (`...`), and statutory citations
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\b(?:Section\s+\d+[A-Z]?(?:\(\d+[a-z]?\))*(?:\([a-z]\))*(?:\s+(?:of\s+the\s+)?(?:BNS|BNSS|BSA|IPC|CrPC|IEA|IT\s+Act|DPDP\s+Act))?|(?:Bharatiya\s+Nyaya\s+Sanhita|Bharatiya\s+Nagarik\s+Suraksha\s+Sanhita|Bharatiya\s+Sakshya\s+Adhiniyam)(?:\s*,?\s*2023)?|\b(?:BNS|BNSS|BSA)\s*(?:2023)?|\b(?:IPC|CrPC|IEA)\s*(?:1860|1973|1872)?|\bArticle\s+\d+[A-Z]?\b))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      tokens.push({
        type: 'bold',
        content: matchedStr.slice(2, -2)
      });
    } else if (matchedStr.startsWith('*') && matchedStr.endsWith('*')) {
      tokens.push({
        type: 'italic',
        content: matchedStr.slice(1, -1)
      });
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      tokens.push({
        type: 'code',
        content: matchedStr.slice(1, -1)
      });
    } else {
      // Statutory Citation
      tokens.push({
        type: 'citation',
        content: matchedStr
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex)
    });
  }

  return tokens;
}

export const InlineMarkdown: React.FC<{ text: string; isDark?: boolean }> = ({ text, isDark }) => {
  const tokens = tokenizeInline(text);

  return (
    <>
      {tokens.map((token, idx) => {
        if (token.type === 'bold') {
          return (
            <strong 
              key={idx} 
              className={`font-bold ${isDark ? 'text-white' : 'text-[#00288e]'}`}
            >
              {token.content}
            </strong>
          );
        }
        if (token.type === 'italic') {
          return (
            <em key={idx} className="italic">
              {token.content}
            </em>
          );
        }
        if (token.type === 'code') {
          return (
            <code 
              key={idx} 
              className={`font-mono text-[11px] px-1.5 py-0.5 rounded border ${
                isDark 
                  ? 'bg-[#181c2d] text-amber-300 border-[#2b334d]' 
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {token.content}
            </code>
          );
        }
        if (token.type === 'citation') {
          return (
            <span 
              key={idx} 
              className={`inline-flex items-center font-semibold rounded px-1.5 py-0.2 mx-0.5 text-[11.5px] border ${
                isDark 
                  ? 'bg-[#131b2e] text-amber-300 border-amber-500/30' 
                  : 'bg-[#eff6ff] text-[#1e3a8a] border-[#bfdbfe]'
              }`}
            >
              {token.content}
            </span>
          );
        }
        return <span key={idx}>{token.content}</span>;
      })}
    </>
  );
};

interface Block {
  type: 'p' | 'blockquote' | 'ul' | 'ol' | 'header';
  level?: number;
  items?: string[];
  text?: string;
}

/**
 * Parses raw markdown lines into structured block elements.
 */
function parseBlocks(markdownText: string): Block[] {
  const lines = markdownText.split('\n');
  const blocks: Block[] = [];
  let currentParagraphLines: string[] = [];
  let currentListItems: string[] = [];
  let currentListType: 'ul' | 'ol' | null = null;
  let currentBlockquoteLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const text = currentParagraphLines.join(' ').trim();
      if (text) {
        blocks.push({ type: 'p', text });
      }
      currentParagraphLines = [];
    }
  };

  const flushList = () => {
    if (currentListItems.length > 0 && currentListType) {
      blocks.push({ type: currentListType, items: [...currentListItems] });
      currentListItems = [];
      currentListType = null;
    }
  };

  const flushBlockquote = () => {
    if (currentBlockquoteLines.length > 0) {
      const text = currentBlockquoteLines.join(' ').trim();
      if (text) {
        blocks.push({ type: 'blockquote', text });
      }
      currentBlockquoteLines = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      flushBlockquote();
      continue;
    }

    // Header (###, ##, #)
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      flushList();
      flushBlockquote();
      blocks.push({
        type: 'header',
        level: headerMatch[1].length,
        text: headerMatch[2].trim()
      });
      continue;
    }

    // Blockquote (> text)
    if (line.startsWith('>')) {
      flushParagraph();
      flushList();
      const quoteContent = line.replace(/^>\s?/, '').trim();
      currentBlockquoteLines.push(quoteContent);
      continue;
    }

    // Unordered list item (- or *)
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      flushBlockquote();
      if (currentListType === 'ol') flushList();
      currentListType = 'ul';
      currentListItems.push(ulMatch[1].trim());
      continue;
    }

    // Ordered list item (1. item)
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      flushBlockquote();
      if (currentListType === 'ul') flushList();
      currentListType = 'ol';
      currentListItems.push(olMatch[2].trim());
      continue;
    }

    // Regular paragraph line
    if (currentListType) {
      // Check if line is indented continuation of list
      if (rawLine.startsWith('   ') || rawLine.startsWith('\t')) {
        const lastIdx = currentListItems.length - 1;
        if (lastIdx >= 0) {
          currentListItems[lastIdx] += ' ' + line;
          continue;
        }
      }
      flushList();
    }
    if (currentBlockquoteLines.length > 0) {
      flushBlockquote();
    }

    currentParagraphLines.push(line);
  }

  flushParagraph();
  flushList();
  flushBlockquote();

  return blocks;
}

export const BlocksRenderer: React.FC<{ blocks: Block[]; isDark?: boolean }> = ({ blocks, isDark }) => {
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        if (block.type === 'p' && block.text) {
          return (
            <p 
              key={idx} 
              className={`text-[13px] leading-relaxed ${
                isDark ? 'text-[#e2e8f0]' : 'text-[#0b1c30]'
              }`}
            >
              <InlineMarkdown text={block.text} isDark={isDark} />
            </p>
          );
        }

        if (block.type === 'blockquote' && block.text) {
          return (
            <blockquote 
              key={idx} 
              className={`p-3 my-2 rounded-lg border-l-4 leading-relaxed italic ${
                isDark 
                  ? 'bg-[#131624] border-l-amber-500 border-y border-r border-[#23283f] text-[#f1f5f9]' 
                  : 'bg-[#faf8f5] border-l-[#00288e] border-y border-r border-[#e2e8f0] text-[#0b1c30]'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                  isDark ? 'text-amber-400' : 'text-[#00288e]'
                }`}>
                  format_quote
                </span>
                <div className="text-[12.5px] font-serif">
                  <InlineMarkdown text={block.text} isDark={isDark} />
                </div>
              </div>
            </blockquote>
          );
        }

        if (block.type === 'ul' && block.items) {
          return (
            <ul key={idx} className="space-y-1.5 my-2">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2 text-[12.5px] leading-relaxed">
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                    isDark ? 'bg-amber-400' : 'bg-[#00288e]'
                  }`} />
                  <div className={isDark ? 'text-[#e2e8f0]' : 'text-[#0b1c30]'}>
                    <InlineMarkdown text={item} isDark={isDark} />
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol' && block.items) {
          return (
            <ol key={idx} className="space-y-2 my-2">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 border ${
                    isDark 
                      ? 'bg-[#181c2d] text-amber-400 border-amber-500/30' 
                      : 'bg-[#eff4ff] text-[#00288e] border-[#bfdbfe]'
                  }`}>
                    {itemIdx + 1}
                  </span>
                  <div className={isDark ? 'text-[#e2e8f0]' : 'text-[#0b1c30]'}>
                    <InlineMarkdown text={item} isDark={isDark} />
                  </div>
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === 'header' && block.text) {
          return (
            <h4 
              key={idx} 
              className={`text-[13px] font-bold mt-3 mb-1 flex items-center gap-1.5 ${
                isDark ? 'text-amber-300' : 'text-[#00288e]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">arrow_right</span>
              <InlineMarkdown text={block.text} isDark={isDark} />
            </h4>
          );
        }

        return null;
      })}
    </div>
  );
};

interface LegalSection {
  title: string;
  icon: string;
  isSummary: boolean;
  blocks: Block[];
}

/**
 * Determines appropriate icon and metadata for legal section headers.
 */
function getSectionMeta(title: string): { icon: string; isSummary: boolean } {
  const lower = title.toLowerCase();

  if (lower.includes('summary') || lower.includes('overview') || lower.includes('plain language') || lower.includes('jurisprudence')) {
    return { icon: 'gavel', isSummary: true };
  }
  if (lower.includes('mandate') || lower.includes('statutory') || lower.includes('what the law')) {
    return { icon: 'menu_book', isSummary: false };
  }
  if (lower.includes('safeguard') || lower.includes('constitutional') || lower.includes('procedural') || lower.includes('right')) {
    return { icon: 'verified_user', isSummary: false };
  }
  if (lower.includes('ingredient') || lower.includes('actus reus') || lower.includes('mens rea')) {
    return { icon: 'balance', isSummary: false };
  }
  if (lower.includes('action plan') || lower.includes('strategy') || lower.includes('advisory') || lower.includes('step')) {
    return { icon: 'checklist', isSummary: false };
  }
  if (lower.includes('helpline') || lower.includes('emergency') || lower.includes('legal aid')) {
    return { icon: 'phone_in_talk', isSummary: false };
  }

  return { icon: 'article', isSummary: false };
}

/**
 * Splits full text into semantic legal sections divided by `### ` headings.
 */
function splitIntoLegalSections(text: string): LegalSection[] {
  const sections: LegalSection[] = [];
  const lines = text.split('\n');

  let currentTitle = '';
  let currentSectionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const headerMatch = line.match(/^#{2,4}\s+(.+)$/);

    if (headerMatch) {
      if (currentTitle || currentSectionLines.length > 0) {
        const rawContent = currentSectionLines.join('\n').trim();
        if (rawContent) {
          const meta = getSectionMeta(currentTitle || 'Executive Legal Summary');
          sections.push({
            title: currentTitle || 'Executive Legal Summary',
            icon: meta.icon,
            isSummary: meta.isSummary,
            blocks: parseBlocks(rawContent)
          });
        }
      }
      currentTitle = headerMatch[1].trim();
      currentSectionLines = [];
    } else {
      currentSectionLines.push(line);
    }
  }

  if (currentTitle || currentSectionLines.length > 0) {
    const rawContent = currentSectionLines.join('\n').trim();
    if (rawContent) {
      const meta = getSectionMeta(currentTitle || 'Executive Legal Summary');
      sections.push({
        title: currentTitle || 'Executive Legal Summary',
        icon: meta.icon,
        isSummary: meta.isSummary,
        blocks: parseBlocks(rawContent)
      });
    }
  }

  // If no markdown headers were found at all, wrap entire content as the summary section
  if (sections.length === 0 && text.trim()) {
    sections.push({
      title: 'Legal Overview',
      icon: 'gavel',
      isSummary: true,
      blocks: parseBlocks(text)
    });
  }

  return sections;
}

/**
 * Main structured legal answer component that cleanly separates the
 * Executive Legal Summary from subsequent statutory analysis sections,
 * rendering all markdown, bullet points, quotes, and citations crisply.
 */
export const LegalStructuredAnswer: React.FC<{
  answerText: string;
  isDark: boolean;
  mode?: string;
}> = ({ answerText, isDark, mode }) => {
  const sections = splitIntoLegalSections(answerText);

  if (sections.length === 0) {
    return null;
  }

  // Primary summary section (first section if marked as summary, or the very first section)
  const summarySection = sections[0];
  const detailedSections = sections.slice(1);

  return (
    <div className="space-y-4 w-full">
      {/* 1. EXECUTIVE LEGAL SUMMARY CALLOUT BOX */}
      <div 
        className={`print-exec-summary p-4 rounded-xl border transition-all shadow-xs ${
          isDark 
            ? 'bg-[#131624] border-[#2b334d] text-[#e2e8f0]' 
            : 'bg-[#eff4ff] border-[#dce9ff] text-[#0b1c30]'
        }`}
      >
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-blue-500/15">
          <div className="flex items-center gap-2">
            <span className={`material-symbols-outlined text-[19px] ${
              isDark ? 'text-amber-400' : 'text-[#00288e]'
            }`}>
              {summarySection.icon || 'gavel'}
            </span>
            <h3 className={`text-[13.5px] font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-[#00288e]'
            }`}>
              {summarySection.title || (mode === 'professional' ? 'Executive Legal Analysis' : 'Key Legal Overview')}
            </h3>
          </div>
          <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
            isDark 
              ? 'bg-[#181c2d] text-amber-300 border-amber-500/30' 
              : 'bg-white text-[#00288e] border-[#bfdbfe]'
          }`}>
            {mode === 'professional' ? 'Advocate Counsel Brief' : 'Citizen Legal Guide'}
          </span>
        </div>

        <BlocksRenderer blocks={summarySection.blocks} isDark={isDark} />
      </div>

      {/* 2. SUBSEQUENT DETAILED STATUTORY & PROCEDURAL SECTIONS */}
      {detailedSections.length > 0 && (
        <div className="space-y-3 pt-1">
          {detailedSections.map((sec, secIdx) => (
            <div 
              key={secIdx}
              className={`p-3.5 rounded-xl border transition-all ${
                isDark 
                  ? 'bg-[#101320] border-[#23283f]' 
                  : 'bg-white border-[#e2e8f0] shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-slate-700/20">
                <span className={`material-symbols-outlined text-[17px] ${
                  isDark ? 'text-amber-400' : 'text-[#00288e]'
                }`}>
                  {sec.icon}
                </span>
                <h4 className={`text-[13px] font-bold tracking-tight ${
                  isDark ? 'text-white' : 'text-[#0b1c30]'
                }`}>
                  {sec.title}
                </h4>
              </div>

              <BlocksRenderer blocks={sec.blocks} isDark={isDark} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
