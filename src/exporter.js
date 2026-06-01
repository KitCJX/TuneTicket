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

/**
 * Copies a DOM element to the system clipboard as a PNG image
 * @param {HTMLElement} element The element to capture and copy
 * @returns {Promise<boolean>} Resolves to true if copy succeeded
 */
export async function copyElementToClipboard(element) {
  try {
    // 1. Ensure all custom fonts are loaded before capturing
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    
    // Give a tiny buffer for layout adjustments
    await new Promise(resolve => setTimeout(resolve, 200));

    // 2. Capture using html2canvas with optimal settings
    const canvas = await html2canvas(element, {
      scale: 3,                // Multiplies size for high-DPI crisp export
      useCORS: true,           // Critical for loading Spotify CDN elements
      allowTaint: false,
      backgroundColor: null,   // Keep background transparent
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure any active transformations or shadows are removed for clipboard clean render
        const clonedCard = clonedDoc.querySelector('.boarding-pass') || clonedDoc.querySelector('.luggage-tag');
        if (clonedCard) {
          clonedCard.style.transform = 'none';
          clonedCard.style.boxShadow = 'none';
        }
      }
    });

    // 3. Convert canvas to blob and write to clipboard
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to generate image blob.'));
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch (err) {
          console.error('Clipboard write error:', err);
          reject(new Error('Writing image to clipboard blocked by browser security or not supported.'));
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Error copying image to clipboard:', error);
    throw error;
  }
}
