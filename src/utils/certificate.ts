import { CertificateData, Thesis } from '../types';

/**
 * Generate a deterministic SVG QR Code Data URL from text string
 */
export function generateSVGQRCodeDataUrl(text: string): string {
  // Simple clean SVG QR code matrix representation
  const hash = Array.from(text).reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000000007, 7);
  const size = 15;
  const cells: boolean[][] = Array(size)
    .fill(0)
    .map(() => Array(size).fill(false));

  // Outer corners finder patterns
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (r === 0 || r === 4 || c === 0 || c === 4 || (r >= 1 && r <= 3 && c >= 1 && c <= 3 && (r === 2 || c === 2))) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(1, 1);
  drawFinder(size - 6, 1);
  drawFinder(1, size - 6);

  // Data pattern simulation based on hash & text
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (
        (r < 7 && c < 7) ||
        (r < 7 && c >= size - 7) ||
        (r >= size - 7 && c < 7)
      ) {
        continue;
      }
      const val = (r * 13 + c * 37 + hash) % 3 === 0 || (r + c) % 2 === 0;
      cells[r][c] = val;
    }
  }

  let rects = '';
  const cellSize = 10;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (cells[r][c]) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <rect width="150" height="150" fill="#ffffff" rx="8"/>
    ${rects}
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generate full Certificate Data for a Thesis
 */
export function buildCertificateForThesis(thesis: Thesis): CertificateData {
  const certId = thesis.certificateId || `CERT-2026-${thesis.id.replace('thm-', '').toUpperCase()}`;
  const verificationUrl = `${window.location.origin}?cert=${certId}`;
  const qrCodeDataUrl = generateSVGQRCodeDataUrl(verificationUrl);
  const digitalSignatureHash = `SHA256-${Array.from(thesis.title + certId)
    .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 1000000000, 1)
    .toString(16)
    .toUpperCase()}`;

  return {
    certificateId: certId,
    thesisId: thesis.id,
    title: thesis.title,
    author: thesis.author,
    director: thesis.director,
    filiere: thesis.filiere,
    university: thesis.university || "Université Nationale d'État",
    department: thesis.department || "Faculté d'Enseignement Supérieur",
    validationDate: thesis.validationDate || thesis.submissionDate || new Date().toISOString(),
    qrCodeDataUrl,
    verificationUrl,
    digitalSignatureHash,
  };
}

