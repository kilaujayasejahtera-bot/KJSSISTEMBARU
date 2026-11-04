/**
 * Utility to reliably download project files even inside sandboxed iframes
 */

export const downloadProjectZip = async (
  onStatusChange?: (status: 'idle' | 'downloading' | 'success' | 'error', msg?: string) => void
) => {
  try {
    onStatusChange?.('downloading', 'Mengunduh file arsip proyek...');
    const zipPath = '/assets/aistudio/KJS_Inventory_Android_Starter_600da52f.zip';
    
    const response = await fetch(zipPath);
    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }
    const blob = await response.blob();
    
    // Create Blob URL
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = 'KJS_Inventory_Android_Project.zip';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 2000);

    onStatusChange?.('success', 'File ZIP berhasil diunduh ke folder Download Anda!');
  } catch (err: any) {
    console.error('Download error:', err);
    // Fallback: try direct window navigation
    try {
      window.open('/assets/aistudio/KJS_Inventory_Android_Starter_600da52f.zip', '_blank');
      onStatusChange?.('success', 'File ZIP dibuka di tab baru untuk diunduh.');
    } catch (e) {
      onStatusChange?.('error', 'Gagal mengunduh langsung dari browser. Gunakan link langsung.');
    }
  }
};
