/**
 * Client-side CSV Exporter Utility
 */
export const exportToCSV = (filename, rows, headers) => {
  if (!rows || !rows.length) return;

  const separator = ',';
  const keys = headers ? headers.map(h => h.key) : Object.keys(rows[0]);
  const headerRow = headers ? headers.map(h => `"${h.label}"`).join(separator) : keys.map(k => `"${k}"`).join(separator);

  const csvContent = [
    headerRow,
    ...rows.map(row =>
      keys
        .map(key => {
          let cell = row[key] === null || row[key] === undefined ? '' : row[key];
          cell = typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
          cell = cell.replace(/"/g, '""');
          return `"${cell}"`;
        })
        .join(separator)
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
