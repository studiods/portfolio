(() => {
  const title = document.querySelector('.about-hero-title');
  if (!title) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const textNodes = Array.from(title.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE);
  let charIndex = 0;

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();

    Array.from(node.textContent || '').forEach((char) => {
      if (/\s/.test(char)) {
        fragment.appendChild(document.createTextNode(char));
        return;
      }

      const span = document.createElement('span');
      span.className = 'typing-char';
      span.textContent = char;
      span.dataset.typingIndex = String(charIndex++);
      fragment.appendChild(span);
    });

    node.replaceWith(fragment);
  });

  const chars = Array.from(title.querySelectorAll('.typing-char'));
  if (!chars.length) return;

  title.classList.add('is-typing');

  const initialDelay = 180;
  const interval = 58;

  chars.forEach((char, index) => {
    window.setTimeout(() => {
      char.classList.add('is-visible');
      if (index === chars.length - 1) title.classList.remove('is-typing');
    }, initialDelay + index * interval);
  });
})();
