const fs = require('fs');
const path = require('path');
const { DOMParser, XMLSerializer } = require('@xmldom/xmldom');

// Simple JUnit aggregator: concatenates <testsuite> entries into one <testsuites>
function mergeJUnitFiles(inputFiles, outFile) {
  const serializer = new XMLSerializer();
  const parser = new DOMParser();
  const suites = [];

  inputFiles.forEach((f) => {
    if (!fs.existsSync(f)) return;
    const xml = fs.readFileSync(f, 'utf8');
    const doc = parser.parseFromString(xml, 'application/xml');
    const testsuites = Array.from(doc.getElementsByTagName('testsuite'));
    testsuites.forEach((ts) => suites.push(ts));
  });

  const outDoc = parser.parseFromString('<testsuites></testsuites>', 'application/xml');
  const root = outDoc.getElementsByTagName('testsuites')[0];

  suites.forEach((s) => {
    const imported = outDoc.importNode(s, true);
    root.appendChild(imported);
  });

  fs.writeFileSync(outFile, serializer.serializeToString(outDoc));
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: node scripts/junit-merge.js out.xml in1.xml in2.xml ...');
    process.exit(2);
  }
  const out = args[0];
  const ins = args.slice(1);
  mergeJUnitFiles(ins, out);
  console.log('Wrote merged junit to', out);
}
