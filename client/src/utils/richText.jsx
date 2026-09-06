import React from 'react';

/**
 * Minimal, safe Markdown renderer.
 *
 * The AI returns Markdown (**bold**, numbered lists, headings, `code`), which
 * previously rendered as literal asterisks and hashes in the chat and trip
 * planner. This converts the common subset into React elements.
 *
 * SECURITY: this never produces raw HTML and never touches
 * dangerouslySetInnerHTML - every node is a React element, so model output (or
 * anything else that flows through here) is escaped by React automatically.
 * Link hrefs are restricted to http/https/mailto.
 */

const SAFE_LINK = /^(https?:\/\/|mailto:)/i;

// Inline: `code`, **bold**, *italic* / _italic_, [text](url), bare URLs.
const INLINE_PATTERN =
  /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(_[^_\n]+_)|(\[[^\]\n]+\]\([^)\s]+\))|(https?:\/\/[^\s<>()]+)/g;

function renderInline(text, keyPrefix) {
  if (!text) return null;

  const nodes = [];
  let lastIndex = 0;
  let match;
  let i = 0;

  INLINE_PATTERN.lastIndex = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-i${i++}`;

    if (token.startsWith('`')) {
      nodes.push(<code key={key} className="gs-md-code">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('[')) {
      const linkMatch = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      if (linkMatch && SAFE_LINK.test(linkMatch[2])) {
        nodes.push(
          <a key={key} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="gs-md-link">
            {linkMatch[1]}
          </a>
        );
      } else {
        nodes.push(token);
      }
    } else if (token.startsWith('http')) {
      nodes.push(
        <a key={key} href={token} target="_blank" rel="noopener noreferrer" className="gs-md-link">
          {token}
        </a>
      );
    } else {
      // *italic* or _italic_
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length ? nodes : text;
}

/**
 * Renders a Markdown-ish string as React elements.
 * @param {string} source
 * @returns {React.ReactNode}
 */
export function renderRichText(source) {
  if (typeof source !== 'string' || !source.trim()) {
    return source || null;
  }

  const lines = source.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];

  let listItems = [];
  let listOrdered = false;
  let paragraph = [];
  let inFence = false;
  let fenceLines = [];
  let key = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      const text = paragraph.join(' ');
      blocks.push(
        <p key={`p${key++}`} className="gs-md-p">{renderInline(text, `p${key}`)}</p>
      );
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      const items = listItems.map((item, idx) => (
        <li key={`li${idx}`} className="gs-md-li">{renderInline(item, `l${key}-${idx}`)}</li>
      ));
      blocks.push(
        listOrdered
          ? <ol key={`ol${key++}`} className="gs-md-ol">{items}</ol>
          : <ul key={`ul${key++}`} className="gs-md-ul">{items}</ul>
      );
      listItems = [];
    }
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Fenced code block
    if (/^\s*```/.test(line)) {
      if (inFence) {
        blocks.push(
          <pre key={`pre${key++}`} className="gs-md-pre gs-overflow-x">
            <code>{fenceLines.join('\n')}</code>
          </pre>
        );
        fenceLines = [];
        inFence = false;
      } else {
        flushAll();
        inFence = true;
      }
      continue;
    }

    if (inFence) {
      fenceLines.push(rawLine);
      continue;
    }

    // Blank line ends the current block
    if (!line.trim()) {
      flushAll();
      continue;
    }

    // Heading
    const heading = /^(#{1,4})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = heading[1].length;
      blocks.push(
        <div key={`h${key++}`} className={`gs-md-h gs-md-h${level}`}>
          {renderInline(heading[2], `h${key}`)}
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flushAll();
      blocks.push(<hr key={`hr${key++}`} className="gs-md-hr" />);
      continue;
    }

    // Ordered list item
    const ordered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (ordered) {
      flushParagraph();
      if (!listOrdered && listItems.length) flushList();
      listOrdered = true;
      listItems.push(ordered[1]);
      continue;
    }

    // Unordered list item
    const unordered = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (unordered) {
      flushParagraph();
      if (listOrdered && listItems.length) flushList();
      listOrdered = false;
      listItems.push(unordered[1]);
      continue;
    }

    // Blockquote
    const quote = /^\s*>\s?(.*)$/.exec(line);
    if (quote) {
      flushAll();
      blocks.push(
        <blockquote key={`bq${key++}`} className="gs-md-quote">
          {renderInline(quote[1], `q${key}`)}
        </blockquote>
      );
      continue;
    }

    // Plain paragraph text
    flushList();
    paragraph.push(line.trim());
  }

  if (inFence && fenceLines.length) {
    blocks.push(
      <pre key={`pre${key++}`} className="gs-md-pre gs-overflow-x">
        <code>{fenceLines.join('\n')}</code>
      </pre>
    );
  }
  flushAll();

  return blocks.length ? blocks : source;
}

export default renderRichText;
