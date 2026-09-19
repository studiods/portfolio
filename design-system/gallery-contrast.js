(() => {
  'use strict';

  const SAMPLE_SIZE = 48;
  const LIGHT_THRESHOLD = 150;

  const sampleEdgeLuminance = (image, side) => {
    if (!image?.complete || !image.naturalWidth || !image.naturalHeight) return null;

    const rect = image.getBoundingClientRect();
    const boxWidth = Math.max(1, rect.width || image.clientWidth || image.naturalWidth);
    const boxHeight = Math.max(1, rect.height || image.clientHeight || image.naturalHeight);
    const scale = Math.max(boxWidth / image.naturalWidth, boxHeight / image.naturalHeight);
    const sourceWidth = Math.min(image.naturalWidth, boxWidth / scale);
    const sourceHeight = Math.min(image.naturalHeight, boxHeight / scale);
    const sourceX = Math.max(0, (image.naturalWidth - sourceWidth) * .5);
    const sourceY = Math.max(0, (image.naturalHeight - sourceHeight) * .5);

    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext('2d', { willReadFrequently:true });
    if (!context) return null;

    context.drawImage(
      image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, SAMPLE_SIZE, SAMPLE_SIZE
    );

    const sampleWidth = 8;
    const sampleTop = 12;
    const sampleHeight = 24;
    const sampleX = side === 'prev' ? 0 : SAMPLE_SIZE - sampleWidth;
    const data = context.getImageData(sampleX, sampleTop, sampleWidth, sampleHeight).data;

    let luminance = 0;
    let count = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 32) continue;
      luminance += (0.2126 * data[i]) + (0.7152 * data[i + 1]) + (0.0722 * data[i + 2]);
      count += 1;
    }
    return count ? luminance / count : null;
  };

  const apply = (root, image) => {
    if (!root || !image) return;
    try {
      const prevLum = sampleEdgeLuminance(image, 'prev');
      const nextLum = sampleEdgeLuminance(image, 'next');
      if (prevLum == null || nextLum == null) throw new Error('Unable to sample image luminance');
      root.style.setProperty('--hm-gallery-nav-prev-color', prevLum > LIGHT_THRESHOLD ? '#111' : '#fff');
      root.style.setProperty('--hm-gallery-nav-next-color', nextLum > LIGHT_THRESHOLD ? '#111' : '#fff');
    } catch (_) {
      root.style.removeProperty('--hm-gallery-nav-prev-color');
      root.style.removeProperty('--hm-gallery-nav-next-color');
    }
  };

  window.HM_DS_GALLERY_CONTRAST = Object.freeze({ apply, sampleEdgeLuminance });
})();