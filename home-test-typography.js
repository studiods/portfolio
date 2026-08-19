(() => {
  'use strict';

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const TEST_SIZE = 100;
  const SCALE_MIN = 0.82;
  const SCALE_MAX = 1.18;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const debug = Object.create(null);
  window.__homeTypographyMetrics = debug;

  const median = values => {
    const list = values.filter(Number.isFinite).sort((a, b) => a - b);
    if (!list.length) return 0;
    const mid = Math.floor(list.length / 2);
    return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
  };

  const fontString = (style, size) => {
    const parts = [];
    if (style.fontStyle && style.fontStyle !== 'normal') parts.push(style.fontStyle);
    if (style.fontWeight) parts.push(style.fontWeight);
    parts.push(`${size}px`);
    parts.push(style.fontFamily || 'sans-serif');
    return parts.join(' ');
  };

  const linesOf = el => {
    if (!el) return [];
    const direct = [...el.children]
      .map(node => node.textContent.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    if (direct.length) return direct;
    const text = el.textContent.replace(/\s+/g, ' ').trim();
    return text ? [text] : [];
  };

  const measure = (el, lines) => {
    if (!ctx || !el || !lines.length) return null;
    const style = getComputedStyle(el);
    ctx.textBaseline = 'alphabetic';
    ctx.font = fontString(style, TEST_SIZE);

    const rows = lines.map(text => {
      const m = ctx.measureText(text);
      const aa = Number.isFinite(m.actualBoundingBoxAscent)
        ? m.actualBoundingBoxAscent : m.fontBoundingBoxAscent;
      const ad = Number.isFinite(m.actualBoundingBoxDescent)
        ? m.actualBoundingBoxDescent : m.fontBoundingBoxDescent;
      const fa = Number.isFinite(m.fontBoundingBoxAscent)
        ? m.fontBoundingBoxAscent : aa;
      const fd = Number.isFinite(m.fontBoundingBoxDescent)
        ? m.fontBoundingBoxDescent : ad;
      return { aa, ad, fa, fd };
    }).filter(row => [row.aa, row.ad, row.fa, row.fd].every(Number.isFinite));

    if (!rows.length) return null;
    return {
      actualAscent: median(rows.map(row => row.aa)) / TEST_SIZE,
      actualDescent: median(rows.map(row => row.ad)) / TEST_SIZE,
      inkHeight: median(rows.map(row => row.aa + row.ad)) / TEST_SIZE,
      fontAscent: median(rows.map(row => row.fa)) / TEST_SIZE,
      fontDescent: median(rows.map(row => row.fd)) / TEST_SIZE
    };
  };

  const geometry = (metric, size, lineHeight) => {
    const fontAscent = metric.fontAscent * size;
    const fontDescent = metric.fontDescent * size;
    const halfLeading = (lineHeight - fontAscent - fontDescent) / 2;
    const baseline = halfLeading + fontAscent;
    const inkTop = baseline - metric.actualAscent * size;
    return { baseline, inkTop, halfLeading };
  };

  const primeSameSize = (source, target) => {
    if (!source || !target) return;
    const sourceStyle = getComputedStyle(source);
    const size = parseFloat(sourceStyle.fontSize) || 16;
    const lineHeight = parseFloat(sourceStyle.lineHeight) || size;
    target.style.setProperty('--metric-font-size', `${size.toFixed(3)}px`);
    target.style.setProperty('--metric-line-height', `${lineHeight.toFixed(3)}px`);
    target.style.setProperty('--metric-shift-y', '0px');
    target.classList.add('metric-calibrated-target');
  };

  const calibrate = (key, source, target) => {
    if (!source || !target) return;
    primeSameSize(source, target);

    const sourceStyle = getComputedStyle(source);
    const sourceSize = parseFloat(sourceStyle.fontSize) || 16;
    const sourceLineHeight = parseFloat(sourceStyle.lineHeight) || sourceSize;
    const sourceMetric = measure(source, linesOf(source));
    const targetMetric = measure(target, linesOf(target));
    if (!sourceMetric || !targetMetric) return;

    const scale = clamp(sourceMetric.inkHeight / targetMetric.inkHeight, SCALE_MIN, SCALE_MAX);
    const targetSize = sourceSize * scale;
    const targetLineHeight = sourceLineHeight;

    const sourceBox = geometry(sourceMetric, sourceSize, sourceLineHeight);
    const targetBox = geometry(targetMetric, targetSize, targetLineHeight);
    const shiftY = sourceBox.inkTop - targetBox.inkTop;
    const baselineDelta = sourceBox.baseline - targetBox.baseline;

    target.style.setProperty('--metric-font-size', `${targetSize.toFixed(3)}px`);
    target.style.setProperty('--metric-line-height', `${targetLineHeight.toFixed(3)}px`);
    target.style.setProperty('--metric-shift-y', `${shiftY.toFixed(3)}px`);
    target.classList.add('metric-calibrated-target');
    target.dataset.metricScale = scale.toFixed(4);
    target.dataset.metricShift = shiftY.toFixed(3);

    debug[key] = {
      sourceSize: Number(sourceSize.toFixed(3)),
      targetSize: Number(targetSize.toFixed(3)),
      targetPercentOfSource: Number((scale * 100).toFixed(2)),
      sourceLineHeight: Number(sourceLineHeight.toFixed(3)),
      targetLineHeight: Number(targetLineHeight.toFixed(3)),
      shiftY: Number(shiftY.toFixed(3)),
      baselineDelta: Number(baselineDelta.toFixed(3)),
      sourceInkHeightRatio: Number(sourceMetric.inkHeight.toFixed(4)),
      targetInkHeightRatio: Number(targetMetric.inkHeight.toFixed(4))
    };
  };

  const pairs = () => {
    const list = [
      {
        key: 'hero',
        source: document.querySelector('.hero-state-quote .hero-quote'),
        target: document.querySelector('.hero-state-definition .definition-copy')
      },
      {
        key: 'hero-source',
        source: document.querySelector('.hero-state-quote .quote-source-only'),
        target: document.querySelector('.hero-state-definition .definition-source')
      }
    ];

    document.querySelectorAll('.principles-intro-row').forEach((row, index) => {
      list.push({
        key: `principles-${index + 1}`,
        source: row.querySelector('.principles-intro-en'),
        target: row.querySelector('.principles-intro-ko')
      });
    });
    return list;
  };

  const primeAll = () => pairs().forEach(pair => primeSameSize(pair.source, pair.target));
  const calibrateAll = () => {
    pairs().forEach(pair => calibrate(pair.key, pair.source, pair.target));
    document.documentElement.dataset.typographyCalibrated = 'v8';
    document.body?.classList.add('typography-v8-ready');
  };

  let raf = 0;
  const schedule = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      raf = 0;
      calibrateAll();
    });
  };

  primeAll();

  const loadFonts = async () => {
    if (!document.fonts) return;
    try {
      await Promise.all([
        document.fonts.load('300 100px "Averta PE"', 'HAMBURGEFONTSIV'),
        document.fonts.load('100 100px Pretendard', '가나다라마바사아자차카타파하'),
        document.fonts.ready
      ]);
    } catch (_) {}
  };

  loadFonts().then(schedule);
  addEventListener('resize', schedule, { passive: true });
})();