// Gallery: clicking a thumbnail plays its video in the hero.
// Below that, the phone menu.

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

// Phone menu: the hamburger shows and hides the nav links (600px and below).

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('#site-menu');

function setMenu(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menu.classList.toggle('is-open', open);
}

menuButton.addEventListener('click', () => {
  setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
});

// Close it after choosing a link, clicking anywhere outside the header,
// pressing Escape, or widening the window past the phone breakpoint.
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) setMenu(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) {
    setMenu(false);
    menuButton.focus();
  }
});

matchMedia('(min-width: 601px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});
