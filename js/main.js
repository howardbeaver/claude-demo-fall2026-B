// Gallery: clicking a thumbnail plays its video in the hero.

const hero = document.querySelector('#hero-video');
const thumbs = [...document.querySelectorAll('.gallery button')];
const nowPlaying = document.querySelector('#now-playing');

function playThumb(thumb) {
  const current = thumbs.find((t) => t.getAttribute('aria-current') === 'true');

  if (thumb === current) {
    // The playing video's thumbnail restarts it instead of reloading it.
    hero.currentTime = 0;
  } else {
    current?.removeAttribute('aria-current');
    thumb.setAttribute('aria-current', 'true');
    hero.poster = thumb.dataset.poster;
    hero.src = thumb.dataset.video;
  }

  // play() must run synchronously inside the click: Safari only allows
  // playback that a user action starts directly.
  hero.play().catch(() => {
    // Interrupted (e.g. another click switched videos first); nothing to do.
  });

  nowPlaying.textContent = `Now playing: ${thumb.querySelector('img').alt}`;
}

for (const thumb of thumbs) {
  thumb.addEventListener('click', () => playThumb(thumb));
}
