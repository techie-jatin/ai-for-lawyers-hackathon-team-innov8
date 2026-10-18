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
              title="Statutory Authority • Verified against Central Acts & 2024 Sanhitas"
              className={`inline-flex items-center gap-1 font-semibold rounded px-1.5 py-0.5 mx-0.5 text-[11.5px] font-mono border shadow-2xs transition-all ${
                isDark 
                  ? 'bg-[#131b2e] hover:bg-[#1a253e] text-amber-300 border-amber-500/30' 
                  : 'bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1e3a8a] border-[#bfdbfe]'
              }`}
            >
              <span className="material-symbols-outlined text-[12px] text-amber-500 shrink-0 select-none" aria-hidden="true">verified</span>
              <span>{token.content}</span>
            </span>
          );
        }
        return <span key={idx}>{token.content}</span>;
      })}
    </>
  );
};

export interface OlItem {
  num: number;
  text: string;
}

export interface TableBlock {
  type: 'table';
  headers: string[];
  alignments: ('left' | 'center' | 'right')[];
  rows: string[][];
}

interface RegularBlock {
  type: 'p' | 'blockquote' | 'ul' | 'ol' | 'header' | 'hr';
  level?: number;
  items?: string[];
  olItems?: OlItem[];
  text?: string;
}

export type Block = RegularBlock | TableBlock;

/**
 * Splits a Markdown table row into trimmed cell strings, handling escaped pipes.
 */
function splitTableRow(rowStr: string): string[] {
  let trimmed = rowStr.trim();
  if (trimmed.startsWith('|')) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed.endsWith('|')) {
    trimmed = trimmed.slice(0, -1);
  }

  const cells: string[] = [];
  let currentCell = '';
  let isEscaped = false;

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    if (char === '\\' && !isEscaped) {
      isEscaped = true;
      currentCell += char;
      continue;
    }
    if (char === '|' && !isEscaped) {
      cells.push(currentCell.trim());
      currentCell = '';
    } else {
      currentCell += char;
    }
    isEscaped = false;
  }
  cells.push(currentCell.trim());
  return cells;
}

/**
 * Checks whether a markdown line is a table delimiter/separator row (e.g. `| :--- | :---: | ---: |`).
 */
function isTableSeparator(rowStr: string): boolean {
  if (!rowStr.includes('-')) return false;
  const cells = splitTableRow(rowStr);
  if (cells.length === 0) return false;
  return cells.every(c => /^:?-+:?$/.test(c.trim()));
}

/**
 * Extracts alignment directives ('left' | 'center' | 'right') from a markdown table separator row.
 */
function parseAlignments(separatorStr: string): ('left' | 'center' | 'right')[] {
  const cells = splitTableRow(separatorStr);
  return cells.map(c => {
    const trimmed = c.trim();
    const startColon = trimmed.startsWith(':');
    const endColon = trimmed.endsWith(':');
    if (startColon && endColon) return 'center';
    if (endColon) return 'right';
    return 'left';
  });
}

/**
 * Normalizes table rows that may have been smashed onto a single line (e.g. `| Col1 | | :--- | | Data |`).
 */
function normalizeMarkdownTables(markdownText: string): string {
  const lines = markdownText.split('\n');
  const normalizedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Check if line contains a smashed table row (has `:---` separator or multiple row boundaries with `| |`)
    if (trimmed.includes('|') && /\|\s*\|\s*:?-+:?/.test(trimmed)) {
      const unSmashed = trimmed.replace(/\|\s*\|\s*/g, '|\n|');
      for (const row of unSmashed.split('\n')) {
        if (row.trim()) normalizedLines.push(row.trim());
      }
    } else {
      normalizedLines.push(line);
    }
  }

  return normalizedLines.join('\n');
}

/**
 * Parses raw markdown lines into structured block elements, including GFM tables.
 */
function parseBlocks(markdownText: string): Block[] {
  const normalizedText = normalizeMarkdownTables(markdownText);
  const lines = normalizedText.split('\n');
  const blocks: Block[] = [];
  let currentParagraphLines: string[] = [];
  let currentUlItems: string[] = [];
  let currentOlItems: OlItem[] = [];
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

  const flushUl = () => {
    if (currentUlItems.length > 0) {
      blocks.push({ type: 'ul', items: [...currentUlItems] });
      currentUlItems = [];
    }
  };

  const flushOl = () => {
    if (currentOlItems.length > 0) {
      blocks.push({ type: 'ol', olItems: [...currentOlItems] });
      currentOlItems = [];
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

  const flushAll = () => {
    flushParagraph();
    flushUl();
    flushOl();
    flushBlockquote();
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushBlockquote();
      // Only flush lists if followed by a non-list item or double blank lines
      if (i + 1 < lines.length && !lines[i + 1].trim()) {
        flushUl();
        flushOl();
      }
      continue;
    }

    // Markdown Table Detection (Header row followed by Separator row `| :--- | :--- |`)
    if (
      line.includes('|') &&
      !isTableSeparator(line) &&
      i + 1 < lines.length &&
      isTableSeparator(lines[i + 1])
    ) {
      flushAll();
      const headers = splitTableRow(line);
      const alignments = parseAlignments(lines[i + 1]);
      i += 2; // Advance past header and separator rows

      const rows: string[][] = [];
      while (i < lines.length) {
        const rowLine = lines[i].trim();
        // Stop table if encountering a blank line, header (#), or horizontal rule (---)
        if (!rowLine || /^[-*_]{3,}$/.test(rowLine) || /^#{1,4}\s+/.test(rowLine)) {
          i--;
          break;
        }
        if (!rowLine.includes('|')) {
          // Wrapped cell without pipe: append to last cell of current row if available
          if (rows.length > 0 && rows[rows.length - 1].length > 0) {
            const lastRow = rows[rows.length - 1];
            lastRow[lastRow.length - 1] += ' ' + rowLine;
            i++;
            continue;
          } else {
            i--;
            break;
          }
        }
        const rowCells = splitTableRow(rowLine);
        while (rowCells.length < headers.length) {
          rowCells.push('');
        }
        rows.push(rowCells.slice(0, headers.length));
        i++;
      }

      blocks.push({
        type: 'table',
        headers,
        alignments,
        rows
      });
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^[-*_]{3,}$/.test(line)) {
      flushAll();
      blocks.push({ type: 'hr' });
      continue;
    }

    // Header (###, ##, #)
    const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headerMatch) {
      flushAll();
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
      flushUl();
      flushOl();
      const quoteContent = line.replace(/^>\s?/, '').trim();
      currentBlockquoteLines.push(quoteContent);
      continue;
    }

    // Unordered list item (- or *)
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      flushOl();
      flushBlockquote();
      currentUlItems.push(ulMatch[1].trim());
      continue;
    }

    // Ordered list item (1. item, 2. item, etc.)
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      flushUl();
      flushBlockquote();
      const num = parseInt(olMatch[1], 10);
      currentOlItems.push({
        num: isNaN(num) ? currentOlItems.length + 1 : num,
        text: olMatch[2].trim()
      });
      continue;
    }

    // Unindented or indented text following an ordered list item becomes part of its descriptive body
    if (currentOlItems.length > 0) {
      currentOlItems[currentOlItems.length - 1].text += '\n' + line;
      continue;
    }

    // Indented continuation of unordered list
    if (currentUlItems.length > 0 && (rawLine.startsWith('   ') || rawLine.startsWith('\t'))) {
      currentUlItems[currentUlItems.length - 1] += ' ' + line;
      continue;
    }

    // Regular paragraph line
    flushUl();
    flushOl();
    if (currentBlockquoteLines.length > 0) {
      flushBlockquote();
    }

    currentParagraphLines.push(line);
  }

  flushAll();

  return blocks;
}

export const BlocksRenderer: React.FC<{ blocks: Block[]; isDark?: boolean }> = ({ blocks, isDark }) => {
  return (
    <div className="space-y-3">
      {blocks.map((block, idx) => {
        if (block.type === 'hr') {
          return (
            <hr 
              key={idx} 
              className={`my-3 border-t ${isDark ? 'border-[#1f2438]' : 'border-[#e2e8f0]'}`} 
            />
          );
        }

        if (block.type === 'p' && block.text) {
          // Avoid rendering standalone markdown horizontal rules that may have leaked
          if (/^[-*_]{3,}$/.test(block.text.trim())) {
            return null;
          }
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

        if (block.type === 'table' && block.headers && block.headers.length > 0) {
          return (
            <div 
              key={idx} 
              className={`w-full overflow-x-auto my-3 rounded-xl border shadow-2xs ${
                isDark 
                  ? 'bg-[#101423] border-[#222842]' 
                  : 'bg-white border-[#e2e8f0]'
              }`}
            >
              <table className="w-full text-left text-[12.5px] border-collapse min-w-[500px]">
                <thead>
                  <tr className={`border-b ${
                    isDark 
                      ? 'bg-[#151a2d] border-[#252b45] text-amber-300' 
                      : 'bg-[#f4f7fc] border-[#e2e8f0] text-[#00288e]'
                  }`}>
                    {block.headers.map((header, hIdx) => {
                      const align = block.alignments[hIdx] || 'left';
                      const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                      return (
                        <th 
                          key={hIdx} 
                          scope="col"
                          className={`px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider font-mono ${alignClass}`}
                        >
                          <InlineMarkdown text={header} isDark={isDark} />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#1e2338]' : 'divide-[#edf2f7]'}`}>
                  {block.rows.map((row, rIdx) => (
                    <tr 
                      key={rIdx} 
                      className={`transition-colors ${
                        isDark 
                          ? 'hover:bg-[#15192c] text-[#e2e8f0]' 
                          : 'hover:bg-[#f8fafc] text-[#0b1c30]'
                      } ${rIdx % 2 === 1 ? (isDark ? 'bg-[#121626]/50' : 'bg-[#fafbfe]') : ''}`}
                    >
                      {row.map((cell, cIdx) => {
                        const align = block.alignments[cIdx] || 'left';
                        const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
                        return (
                          <td 
                            key={cIdx} 
                            className={`px-3.5 py-2.5 align-top leading-relaxed ${alignClass}`}
                          >
                            <InlineMarkdown text={cell} isDark={isDark} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <span className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 select-none ${
                  isDark ? 'text-amber-400' : 'text-[#00288e]'
                }`} aria-hidden="true">
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
            <ul key={idx} className="space-y-2 my-2">
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

        // Ordered List with persistent numbers and multi-line body rendering
        if (block.type === 'ol') {
          const olItems = block.olItems || (block.items?.map((it, i) => ({ num: i + 1, text: it })) || []);
          return (
            <ol key={idx} className="space-y-3 my-2">
              {olItems.map((item, itemIdx) => {
                const lines = item.text.split('\n');
                const titleLine = lines[0];
                const bodyLines = lines.slice(1).filter(l => l.trim().length > 0);

                return (
                  <li key={itemIdx} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 border ${
                      isDark 
                        ? 'bg-[#181c2d] text-amber-400 border-amber-500/30' 
                        : 'bg-[#eff4ff] text-[#00288e] border-[#bfdbfe]'
                    }`}>
                      {item.num || (itemIdx + 1)}
                    </span>
                    <div className={`flex-1 min-w-0 ${isDark ? 'text-[#e2e8f0]' : 'text-[#0b1c30]'}`}>
                      <div>
                        <InlineMarkdown text={titleLine} isDark={isDark} />
                      </div>
                      {bodyLines.length > 0 && (
                        <div className={`mt-1.5 space-y-1.5 text-[12px] leading-relaxed ${
                          isDark ? 'text-[#cbd5e1]' : 'text-[#334155]'
                        }`}>
                          {bodyLines.map((bLine, bIdx) => (
                            <p key={bIdx}>
                              <InlineMarkdown text={bLine} isDark={isDark} />
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
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
              <span className="material-symbols-outlined text-[15px] select-none" aria-hidden="true">arrow_right</span>
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
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Skip horizontal rule dividers (---, ***, ___) between sections
    if (/^[-*_]{3,}$/.test(line)) {
      continue;
    }

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
            <span className={`material-symbols-outlined text-[19px] select-none ${
              isDark ? 'text-amber-400' : 'text-[#00288e]'
            }`} aria-hidden="true">
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
                <span className={`material-symbols-outlined text-[17px] select-none ${
                  isDark ? 'text-amber-400' : 'text-[#00288e]'
                }`} aria-hidden="true">
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
