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

    const isTag = element.classList.contains('luggage-tag');
    const targetWidth = isTag ? 380 : 780;
    const targetHeight = isTag ? 680 : 440;

    // 2. Capture using html2canvas with optimal settings
    const canvas = await html2canvas(element, {
      scale: 3,                // Multiplies size for high-DPI crisp export (good for Instagram/Twitter)
      useCORS: true,           // Critical for loading Spotify CDN album arts/profile pictures
      allowTaint: false,
      backgroundColor: null,   // Keep background transparent so the rounded corners look right
      logging: false,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      onclone: (clonedDoc) => {
        // Force the iframe body to have the exact native width of the card to prevent layout squishing on mobile
        if (clonedDoc.body) {
          clonedDoc.body.style.width = `${targetWidth}px`;
          clonedDoc.body.style.minWidth = `${targetWidth}px`;
          clonedDoc.body.style.webkitTextSizeAdjust = '100%';
          clonedDoc.body.style.textSizeAdjust = '100%';
        }
        
        // Copy loaded fonts from parent document to ensure perfect layout bounds measurements on Safari/iOS
        if (document.fonts && clonedDoc.fonts) {
          try {
            document.fonts.forEach(font => {
              clonedDoc.fonts.add(font);
            });
          } catch (e) {
            console.warn('Failed to copy FontFace to cloned iframe:', e);
          }
        }
        
        const clonedCard = clonedDoc.querySelector('.boarding-pass') || clonedDoc.querySelector('.luggage-tag');
        if (clonedCard) {
          clonedCard.style.transform = 'none';
          clonedCard.style.boxShadow = 'none';
          clonedCard.style.position = 'relative';
          clonedCard.style.left = '0';
          clonedCard.style.margin = '0';
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
 * Copies a DOM element to the system clipboard as a PNG image.
 * Solves browser security blocks (especially Safari) by passing a Promise
 * directly to the ClipboardItem constructor to preserve the user gesture context.
 * @param {HTMLElement} element The element to capture and copy
 * @returns {Promise<boolean>} Resolves to true if copy succeeded
 */
export async function copyElementToClipboard(element) {
  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API is not supported in this browser or context.');
  }

  // Define the asynchronous image generation promise
  const imagePromise = (async () => {
    try {
      // 1. Ensure all custom fonts are loaded before capturing
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      
      // Give a tiny buffer for layout adjustments
      await new Promise(resolve => setTimeout(resolve, 100));

      const isTag = element.classList.contains('luggage-tag');
      const targetWidth = isTag ? 380 : 780;
      const targetHeight = isTag ? 680 : 440;

      // 2. Capture using html2canvas with optimal settings
      const canvas = await html2canvas(element, {
        scale: 3,                // Multiplies size for high-DPI crisp export
        useCORS: true,           // Critical for loading Spotify CDN elements
        allowTaint: false,
        backgroundColor: null,   // Keep background transparent
        logging: false,
        windowWidth: targetWidth,
        windowHeight: targetHeight,
        onclone: (clonedDoc) => {
          // Force the iframe body to have the exact native width of the card to prevent layout squishing on mobile
          if (clonedDoc.body) {
            clonedDoc.body.style.width = `${targetWidth}px`;
            clonedDoc.body.style.minWidth = `${targetWidth}px`;
            clonedDoc.body.style.webkitTextSizeAdjust = '100%';
            clonedDoc.body.style.textSizeAdjust = '100%';
          }
          
          // Copy loaded fonts from parent document to ensure perfect layout bounds measurements on Safari/iOS
          if (document.fonts && clonedDoc.fonts) {
            try {
              document.fonts.forEach(font => {
                clonedDoc.fonts.add(font);
              });
            } catch (e) {
              console.warn('Failed to copy FontFace to cloned iframe:', e);
            }
          }
          
          // Ensure any active transformations or shadows are removed for clipboard clean render
          const clonedCard = clonedDoc.querySelector('.boarding-pass') || clonedDoc.querySelector('.luggage-tag');
          if (clonedCard) {
            clonedCard.style.transform = 'none';
            clonedCard.style.boxShadow = 'none';
            clonedCard.style.position = 'relative';
            clonedCard.style.left = '0';
            clonedCard.style.margin = '0';
          }
        }
      });

      // 3. Return a promise that resolves to the blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate image blob.'));
        }, 'image/png');
      });
    } catch (err) {
      console.error('Error generating image for clipboard:', err);
      throw err;
    }
  })();

  try {
    // Attempt Promise-based clipboard write (Safari & modern Chrome support this)
    // By passing the promise immediately, the browser registers the user gesture synchronously.
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': imagePromise
      })
    ]);
    return true;
  } catch (err) {
    console.warn('Promise-based ClipboardItem write failed, attempting standard resolved write fallback...', err);
    try {
      // Fallback for browsers that don't support promises inside ClipboardItem (like Firefox or older Chrome)
      const blob = await imagePromise;
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
      return true;
    } catch (fallbackErr) {
      console.error('Standard clipboard write fallback failed:', fallbackErr);
      throw new Error('Clipboard copy blocked by browser security or not supported.');
    }
  }
}
