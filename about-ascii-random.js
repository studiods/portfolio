(() => {
  'use strict';

  const packed = window.ABOUT_ASCII_PACKED;
  if (!packed || !Array.isArray(packed.bytes) || Number(packed.count) !== 7) return;

  const width = Number(packed.width) || 144;
  const height = Number(packed.height) || 81;
  const count = Number(packed.count) || 7;
  const bytesPerFrame = Math.ceil((width * height) / 2);
  const original = packed.bytes.slice();
  const order = Array.from({ length: count }, (_, index) => index);

  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  if (order.every((value, index) => value === index) && order.length > 1) {
    [order[0], order[1]] = [order[1], order[0]];
  }

  packed.bytes = order.flatMap(index =>
    original.slice(index * bytesPerFrame, (index + 1) * bytesPerFrame)
  );

  let hash = 0x811c9dc5;
  for (let i = 0; i < packed.bytes.length; i += 1) {
    hash ^= packed.bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  packed.checksum = (hash >>> 0).toString(16).padStart(8, '0');
  packed.order = order;
})();
