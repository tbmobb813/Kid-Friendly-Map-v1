#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const glob = require('glob');

function fixFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const lines = original.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inFence = false;
  let fenceChar = '```';
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Handle code fence start/end
    const fenceMatch = line.match(/^(\s*)(```+)(\s*.*)$/);
    if (fenceMatch) {
      const indent = fenceMatch[1];
      const fence = fenceMatch[2];
      const rest = fenceMatch[3] || '';
      if (!inFence) {
        // opening fence
        // ensure blank line before fence if not at top and previous isn't blank
        if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
        // if rest (language) is empty or only spaces, add 'text'
        const lang = rest.trim();
        if (lang === '') {
          line = indent + fence + ' text';
        }
        out.push(line);
        inFence = true;
      } else {
        // closing fence
        out.push(line);
        inFence = false;
        // ensure blank line after fence if next line exists and not blank
        const next = lines[i + 1];
        if (next !== undefined && next.trim() !== '') out.push('');
      }
      continue;
    }

    if (inFence) {
      out.push(line);
      continue;
    }

    // Headings: ensure blank line before ATX heading (unless it's the first line)
    if (/^\s{0,3}#{1,6}\s+/.test(line)) {
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      out.push(line);
      continue;
    }

    // Lists: detect start of list and ensure blank lines around
    const isListItem = /^\s{0,3}([-*+]\s+|\d+\.\s+)/.test(line);
    if (isListItem) {
      // if previous line exists and not blank, insert blank
      if (out.length > 0 && out[out.length - 1].trim() !== '') out.push('');
      // convert ordered list numbers to '1.' style
      const orderedMatch = line.match(/^(\s*)(\d+)\.(\s+)(.*)$/);
      if (orderedMatch) {
        const indent = orderedMatch[1];
        const space = orderedMatch[3];
        const rest = orderedMatch[4];
        line = indent + '1.' + space + rest;
      }
      out.push(line);
      // lookahead: if next lines end list, ensure a blank after list block (we'll handle when list ends)
      continue;
    }

    // Ensure blank line after list block end: if previous line was a list item and current is non-blank and not another list item
    const prevWasList = out.length > 0 && /^\s{0,3}([-*+]\s+|\d+\.\s+)/.test(out[out.length - 1]);
    if (prevWasList && line.trim() !== '' && !isListItem) {
      out.push('');
    }

    // Remove trailing spaces
    if (line.endsWith(' ')) line = line.replace(/[ \t]+$/, '');

    out.push(line);
  }

  // Ensure file ends with single newline
  while (out.length > 0 && out[out.length - 1] === '') out.pop();
  out.push('');
  const fixed = out.join('\n');
  if (fixed !== original) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    return true;
  }
  return false;
}

function run() {
  const files = require('glob').sync('docs/**/*.md', { nodir: true });
  let changed = 0;
  for (const f of files) {
    try {
      const ok = fixFile(f);
      if (ok) {
        console.log('fixed', f);
        changed++;
      }
    } catch (err) {
      console.error('error', f, err.message);
    }
  }
  console.log('done. files changed:', changed);
}

run();
