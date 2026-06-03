import html2canvas from 'html2canvas';

const EXPORT_DIMENSIONS = {
  ticket: { width: 780, height: 440 },
  tag: { width: 380, height: 680 }
};

function getExportDimensions(element) {
  return element.classList.contains('luggage-tag')
    ? EXPORT_DIMENSIONS.tag
    : EXPORT_DIMENSIONS.ticket;
}

function createNativeExportClone(element, width, height) {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.position = 'absolute';
  host.style.left = `-${width + 1024}px`;
  host.style.top = '0';
  host.style.width = `${width}px`;
  host.style.height = `${height}px`;
  host.style.overflow = 'hidden';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '0';
  host.style.contain = 'layout style paint';
  host.style.webkitTextSizeAdjust = '100%';
  host.style.textSizeAdjust = '100%';

  const clone = element.cloneNode(true);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minWidth = `${width}px`;
  clone.style.maxWidth = `${width}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.maxHeight = `${height}px`;
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'center top';
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.margin = '0';
  clone.style.flexShrink = '0';
  clone.style.boxShadow = 'none';

  host.appendChild(clone);
  document.body.appendChild(host);

  return { host, clone };
}

export async function renderElementToCanvas(element) {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  await new Promise(resolve => requestAnimationFrame(() => resolve()));

  const { width, height } = getExportDimensions(element);
  const { host, clone } = createNativeExportClone(element, width, height);

  try {
    return await html2canvas(clone, {
      width,
      height,
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      logging: false,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0
    });
  } finally {
    host.remove();
  }
}

/**
 * Exports a DOM element as a downloadable image (PNG)
 * @param {HTMLElement} element The element to capture
 * @param {string} filename The name of the downloaded file
 */
export async function exportElementAsImage(element, filename = 'tuneticket-boarding-pass.png') {
  try {
    const canvas = await renderElementToCanvas(element);

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
      const canvas = await renderElementToCanvas(element);

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
