/**
 * CSV Export utility for MedSi Clinic Booking
 * Specifically optimized for:
 * 1. 100% Vietnamese Unicode preservation (Bệnh nhân, Bác sĩ, Bệnh viện)
 *    - Uses pure UTF-8 BOM (\uFEFF -> 0xEF, 0xBB, 0xBF)
 *    - Omits the problematic `sep=` directive which causes Microsoft Excel to downgrade to ANSI
 * 2. Proper column separation without bundling into a single column
 *    - Defaults to semicolon `;` for Excel on Windows with Vietnamese/European regional settings
 *    - Also supports standard comma `,` for Google Sheets / macOS / international tools
 * 3. Leading zero preservation for phone numbers and codes (e.g. 0901234567)
 * 4. Full RFC 4180 escaping for quotes, delimiters, and linebreaks
 */

/**
 * Format a single CSV cell value
 * @param {any} value
 * @param {boolean} preserveLeadingZeros - If true and value starts with 0 (e.g. phone number)
 * @param {string} delimiter - The delimiter character (',' or ';')
 * @returns {string}
 */
export function formatCSVCell(value, preserveLeadingZeros = false, delimiter = ';') {
  if (value === null || value === undefined) {
    return '""';
  }

  const str = String(value);

  // If phone number or code starting with 0, format as Excel text formula ="0901234567"
  if (preserveLeadingZeros && /^0\d+$/.test(str.trim())) {
    return `="${str.trim()}"`;
  }

  // Escape double quotes by doubling them
  const escaped = str.replace(/"/g, '""');

  // Enclose in quotes if it contains delimiter, double quotes, or newlines
  if (
    escaped.includes(delimiter) ||
    escaped.includes('"') ||
    escaped.includes('\n') ||
    escaped.includes('\r')
  ) {
    return `"${escaped}"`;
  }

  // Always wrap strings in double quotes for maximum consistency across spreadsheet apps
  return `"${escaped}"`;
}

/**
 * Generate properly formatted CSV content with pure UTF-8 BOM
 * @param {string[]} headers - Column titles
 * @param {Array<Array<any>>} rows - Matrix of row cells
 * @param {object} [options]
 * @param {string} [options.delimiter=';'] - Column delimiter (';' for Excel VN, ',' for Google Sheets)
 * @returns {string}
 */
export function buildCSVContent(headers, rows, options = {}) {
  const delimiter = options.delimiter || ';';

  const headerLine = headers
    .map((h) => formatCSVCell(h, false, delimiter))
    .join(delimiter);

  const rowLines = rows.map((row) =>
    row
      .map((cell, idx) => {
        // Detect phone column or value starting with 0
        const isPhone = typeof cell === 'string' && /^0\d{8,10}$/.test(cell.trim());
        return formatCSVCell(cell, isPhone, delimiter);
      })
      .join(delimiter)
  );

  // Pure UTF-8 BOM (\uFEFF) at index 0 guarantees Excel correctly detects UTF-8
  // and renders all Vietnamese diacritics (ă, â, đ, ê, ô, ơ, ư, dấu hỏi/ngã/nặng...) cleanly.
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

/**
 * Trigger browser download for a CSV string
 * @param {string} csvContent
 * @param {string} fileName
 */
export function downloadCSV(csvContent, fileName = 'export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
