import html2canvas from 'html2canvas';

/**
 * Exports a DOM element as a downloadable image (PNG)
 * @param {HTMLElement} element The element to capture
 * @param {string} filename The name of the downloaded file
 */
export async function exportElementAsImage(element, filename = 'tuneticket-boarding-pass.png') {
  try {
    // 1. Ensure all custom fonts are loaded before capturing
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    
    // Give a tiny buffer for layout adjustments
    await new Promise(resolve => setTimeout(resolve, 200));

    // 2. Capture using html2canvas with optimal settings
    const canvas = await html2canvas(element, {
      scale: 3,                // Multiplies size for high-DPI crisp export (good for Instagram/Twitter)
      useCORS: true,           // Critical for loading Spotify CDN album arts/profile pictures
      allowTaint: false,
      backgroundColor: null,   // Keep background transparent so the rounded corners look right
      logging: false,
      onclone: (clonedDoc) => {
        // Here we can perform adjustments on the cloned document if needed
        // For example, making sure there are no rendering glitches
        const clonedCard = clonedDoc.querySelector('.boarding-pass');
        if (clonedCard) {
          clonedCard.style.transform = 'none';
          clonedCard.style.boxShadow = 'none';
          // Ensure fonts and letter-spacings render properly
        }
      }
    });

    // 3. Convert canvas to data URL and trigger download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    
    return true;
  } catch (error) {
    console.error('Error generating image export:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
}
