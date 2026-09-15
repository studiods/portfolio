/* WORKS / NBT thumbnail timing — always expose the clip from frame 0 when it becomes focused.
   The shared Works runtime normally resumes a video from the paused frame after it leaves/re-enters
   the center focus band. NBT intentionally opts out so its opening sequence is never skipped. */
(() => {
  'use strict';

  const video = document.querySelector('#works-project-10 .works-card-video');
  const mediaLink = video?.closest('.works-card-media-link');
  if (!video || !mediaLink) return;

  let wasFocused = mediaLink.classList.contains('is-video-focused');

  const resetToStart = () => {
    try {
      if (video.currentTime !== 0) video.currentTime = 0;
    } catch (_) {}
  };

  const sync = () => {
    const focused = mediaLink.classList.contains('is-video-focused');

    if (focused && !wasFocused) {
      /* Entering focus: discard any previously paused timestamp and start at the opening frame. */
      video.pause();
      resetToStart();
      video.preload = 'auto';
      const attempt = video.play?.();
      if (attempt?.catch) attempt.catch(() => {});
    } else if (!focused && wasFocused) {
      /* Leaving focus: do not preserve a mid-clip resume point for the next visit. */
      video.pause();
      resetToStart();
    }

    wasFocused = focused;
  };

  const observer = new MutationObserver(sync);
  observer.observe(mediaLink, {attributes:true, attributeFilter:['class']});

  video.addEventListener('loadedmetadata', () => {
    if (!mediaLink.classList.contains('is-video-focused')) resetToStart();
  });
  window.addEventListener('pageshow', sync);
})();
