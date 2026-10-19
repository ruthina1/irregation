export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;

  // Extract headers
  const headers = Object.keys(data[0]).join(',');
  
  // Extract rows
  const rows = data.map(row => 
    Object.values(row).map(val => {
      // Handle nested objects/arrays by stringifying them, escape quotes
      if (typeof val === 'object' && val !== null) {
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }
      // Wrap strings in quotes to prevent comma splitting issues
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};