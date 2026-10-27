// Gallery: clicking a thumbnail plays its video in the hero.
// Below that, the strip's scroll arrows and the phone menu.

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

// Once the page has loaded, fetch every poster frame so a switch shows the
// new video's first frame straight away instead of a blank player.
window.addEventListener('load', () => {
  for (const thumb of thumbs) {
    new Image().src = thumb.dataset.poster;
  }
});

// Strip arrows: each click scrolls one page of whole thumbnails (as many as
// fit), and scroll snapping lines the next one up with the edge. An arrow
// hides at its end of the row; both hide when everything fits.

const gallery = document.querySelector('.gallery');
const prevArrow = document.querySelector('.gallery-prev');
const nextArrow = document.querySelector('.gallery-next');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function pageWidth() {
  const items = gallery.children;
  const style = getComputedStyle(gallery);
  const visible = gallery.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  if (items.length < 2) return visible;
  const step = items[1].offsetLeft - items[0].offsetLeft; // thumbnail + gap
  const gap = parseFloat(style.columnGap) || 0;
  return Math.max(1, Math.floor((visible + gap) / step)) * step;
}

function scrollGallery(direction) {
  gallery.scrollBy({
    left: direction * pageWidth(),
    behavior: reduceMotion.matches ? 'auto' : 'smooth',
  });
}

function updateArrows() {
  const atStart = gallery.scrollLeft <= 1;
  const atEnd = gallery.scrollLeft >= gallery.scrollWidth - gallery.clientWidth - 1;

  // A disabled button drops keyboard focus, so hand it to the other arrow.
  if (atStart && !atEnd && document.activeElement === prevArrow) nextArrow.focus();
  if (atEnd && !atStart && document.activeElement === nextArrow) prevArrow.focus();

  prevArrow.disabled = atStart;
  nextArrow.disabled = atEnd;
}

prevArrow.addEventListener('click', () => scrollGallery(-1));
nextArrow.addEventListener('click', () => scrollGallery(1));
gallery.addEventListener('scroll', updateArrows, { passive: true });
window.addEventListener('resize', updateArrows);
updateArrows();

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
