export type CommissionPdfRow = { label: string; value: string };

export type CommissionPdfDoc = {
  filename: string;
  title: string;
  subtitle: string;
  rows: CommissionPdfRow[];
  note: string;
};

function escapePdf(value: string) {
  const ascii = value
    .replace(/£/g, "GBP ")
    .replace(/₹/g, "INR ")
    .replace(/€/g, "EUR ")
    .replace(/[^\n\r\x20-\x7E]/g, "-");
  return ascii.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(value: string, width: number) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.length > 0 ? lines : [""];
}

/** One-page or multi-page commission statement. Built-in Helvetica only, so it opens everywhere. */
export function buildCommissionPdf(doc: CommissionPdfDoc): Uint8Array {
  const pageWidth = 595;
  const pageHeight = 842;
  const left = 48;
  const right = pageWidth - 48;
  const pages: string[] = [];
  let commands: string[] = [];
  let y = pageHeight - 48;

  const paintHeader = () => {
    commands.push("0.918 0.345 0.047 rg");
    commands.push(`0 ${pageHeight - 28} ${pageWidth} 28 re f`);
    commands.push("1 1 1 rg");
    commands.push("BT /F2 11 Tf 48 822 Td (Dakshinvedha Abroad Solutions) Tj ET");
    commands.push("0 0 0 rg");
  };

  const newPage = () => {
    if (commands.length > 0) pages.push(commands.join("\n"));
    commands = [];
    y = pageHeight - 56;
    paintHeader();
  };

  const text = (font: "F1" | "F2", size: number, x: number, color: string, value: string) => {
    commands.push(`${color} rg`);
    commands.push(`BT /${font} ${size} Tf ${x} ${y} Td (${escapePdf(value)}) Tj ET`);
  };

  const ensure = (needed: number) => {
    if (y - needed < 56) newPage();
  };

  newPage();
  y = pageHeight - 64;
  text("F2", 18, left, "0.12 0.16 0.22", doc.title);
  y -= 18;
  for (const line of wrap(doc.subtitle, 88)) {
    ensure(16);
    text("F1", 10, left, "0.39 0.45 0.55", line);
    y -= 14;
  }
  y -= 8;
  commands.push("0.90 0.91 0.93 RG");
  commands.push(`${left} ${y} m ${right} ${y} l S`);
  y -= 22;

  for (const row of doc.rows) {
    const valueLines = wrap(row.value || "—", 62);
    ensure(16 + valueLines.length * 13);
    text("F2", 9, left, "0.39 0.45 0.55", row.label.toUpperCase());
    valueLines.forEach((line, index) => {
      if (index > 0) y -= 13;
      text("F1", 11, left + 170, "0.12 0.16 0.22", line);
    });
    y -= 18;
  }

  y -= 6;
  commands.push("0.90 0.91 0.93 RG");
  commands.push(`${left} ${y + 8} m ${right} ${y + 8} l S`);
  y -= 8;
  for (const line of wrap(doc.note, 92)) {
    ensure(14);
    text("F1", 9, left, "0.39 0.45 0.55", line);
    y -= 13;
  }

  pages.push(commands.join("\n"));

  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
  };

  const pageIds = pages.map((_, index) => 5 + index * 2);
  add("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n");
  add(`2 0 obj << /Type /Pages /Count ${pages.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >> endobj\n`);
  add("3 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n");
  add("4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> endobj\n");

  pages.forEach((stream, index) => {
    const pageId = 5 + index * 2;
    const contentId = pageId + 1;
    add(
      `${pageId} 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >> endobj\n`
    );
    add(`${contentId} 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj\n`);
  });

  let body = "%PDF-1.4\n";
  const xref: number[] = [0];
  for (const object of objects) {
    xref.push(body.length);
    body += object;
  }
  const xrefStart = body.length;
  body += `xref\n0 ${xref.length}\n`;
  body += "0000000000 65535 f \n";
  for (const offset of xref.slice(1)) {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  body += `trailer << /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return new TextEncoder().encode(body);
}

export function downloadCommissionPdf(doc: CommissionPdfDoc) {
  const bytes = buildCommissionPdf(doc);
  const copy = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(copy).set(bytes);
  const blob = new Blob([copy], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = doc.filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
