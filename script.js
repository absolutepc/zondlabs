'use strict';

// Five-by-seven vector dot numerals, including the product/slider indices.
const glyphs = {
  '0':['01110','10001','10011','10101','11001','10001','01110'],
  '1':['00100','01100','00100','00100','00100','00100','01110'],
  '2':['01110','10001','00001','00010','00100','01000','11111'],
  '3':['11110','00001','00001','01110','00001','00001','11110'],
  '4':['00010','00110','01010','10010','11111','00010','00010'],
  '5':['11111','10000','10000','11110','00001','00001','11110'],
  '6':['01110','10000','10000','11110','10001','10001','01110'],
  '7':['11111','00001','00010','00100','01000','01000','01000'],
  '8':['01110','10001','10001','01110','10001','10001','01110'],
  '9':['01110','10001','10001','01111','00001','00001','01110']
};
function renderDots(el) {
  const text = el.dataset.dots || '';
  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', `-0.5 -0.5 ${text.length * 6} 8`);
  svg.setAttribute('preserveAspectRatio', 'xMinYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  const dots = document.createElementNS(svgNs, 'g');
  dots.setAttribute('fill', 'currentColor');
  for (const [index, char] of [...text].entries()) {
    const rows = glyphs[char];
    if (!rows) continue;
    rows.forEach((row, y) => [...row].forEach((on, x) => {
      if (on === '1') {
        const circle = document.createElementNS(svgNs, 'circle');
        circle.setAttribute('cx', index * 6 + x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '.36');
        dots.append(circle);
      }
    }));
  }
  svg.append(dots);
  el.replaceChildren(svg);
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', text);
}
document.querySelectorAll('[data-dots]').forEach(renderDots);

// Accessible navigation, including Escape, focus restoration and section highlighting.
const menuButton = document.getElementById('menuButton');
const mobileMenu = document.getElementById('mobileMenu');
const header = document.querySelector('.site-header');
function setMenu(open, restoreFocus = false) {
  menuButton.classList.toggle('is-open', open);
  mobileMenu.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  mobileMenu.inert = !open;
  if (!open && restoreFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
window.addEventListener('resize', () => { if (window.innerWidth > 820) setMenu(false); });
document.addEventListener('pointerdown', event => {
  if (menuButton.getAttribute('aria-expanded') === 'true' && !header.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    setMenu(false, true);
    event.preventDefault();
  }
});

const navAnchors = [...document.querySelectorAll('.desktop-nav a')];
const sections = [...document.querySelectorAll('#top, #xdot, #technology, #directions, #mission')];
let scrollScheduled = false;
function highlightSection() {
  let active = '#top';
  const threshold = 130 + Math.min(window.innerHeight * .24, 175);
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= threshold) active = `#${section.id}`;
  }
  for (const a of navAnchors) {
    const selected = a.getAttribute('href') === active;
    a.classList.toggle('nav-active', selected);
    if (selected) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  }
  scrollScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    window.requestAnimationFrame(highlightSection);
  }
}, { passive: true });
window.addEventListener('load', highlightSection);

// Preloading and request tokens prevent older requests from overwriting newer choices.
function loadImage(src, onSuccess, onError) {
  const image = new Image();
  image.decoding = 'async';
  image.onload = onSuccess;
  image.onerror = onError;
  image.src = src;
  if (image.complete && image.naturalWidth > 0) onSuccess();
  return image;
}

const galleryButtons = [...document.querySelectorAll('.mini-image')];
const featureImage = document.getElementById('featureImage');
const galleryCaption = document.getElementById('galleryCaption');
let galleryRequest = 0;
function selectGallery(button, focus = false) {
  if (!button || button.classList.contains('is-active')) return;
  const token = ++galleryRequest;
  featureImage.classList.add('is-changing');
  loadImage(button.dataset.src, () => {
    if (token !== galleryRequest) return;
    featureImage.src = button.dataset.src;
    featureImage.alt = button.dataset.alt;
    galleryCaption.textContent = button.dataset.caption;
    galleryButtons.forEach(b => {
      const selected = b === button;
      b.classList.toggle('is-active', selected);
      b.setAttribute('aria-pressed', String(selected));
    });
    featureImage.classList.remove('is-changing');
    if (focus) button.focus();
  }, () => {
    if (token === galleryRequest) featureImage.classList.remove('is-changing');
  });
}
galleryButtons.forEach((button, index) => {
  button.addEventListener('click', () => selectGallery(button));
  button.addEventListener('keydown', e => {
    let next = index;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % galleryButtons.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index - 1 + galleryButtons.length) % galleryButtons.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = galleryButtons.length - 1;
    else return;
    e.preventDefault();
    if (next === index) button.focus();
    else selectGallery(galleryButtons[next], true);
  });
});

const slides = [
  {
    eyebrow: 'СОБСТВЕННЫЕ ТЕХНОЛОГИИ',
    heading: 'Технологии<br>в реальном<br><span>мире</span>',
    description: 'Мы создаём электронные устройства, которые делают жизнь удобнее, умнее и технологичнее.',
    caption: 'ЭЛЕКТРОНИКА / ДИЗАЙН / ИНЖЕНЕРИЯ',
    title: 'xDot', side: 'ПРЕМИАЛЬНАЯ<br>ЭЛЕКТРОНИКА', image: '/assets/bmw-m5-f90-xdot.webp', alt: 'BMW M5 F90 с установленным xDot вместо эмблемы на крышке багажника',
  },
  {
    eyebrow: 'ДИЗАЙН ZOND LABS',
    heading: 'Дизайн<br>в каждой<br><span>детали</span>',
    description: 'От корпуса до комплектации — мы проектируем устройства, которыми приятно пользоваться.',
    caption: 'КОМПОНОВКА / МАТЕРИАЛЫ / ЭСТЕТИКА',
    title: 'Дизайн', side: 'ПРОДУМАННАЯ<br>КОНСТРУКЦИЯ', image: '/assets/case-3.webp', alt: 'Проработка конструкции фирменного футляра xDot',
  },
  {
    eyebrow: 'ИНЖЕНЕРИЯ ZOND LABS',
    heading: 'Собственная<br>инженерия<br><span>решений</span>',
    description: 'Аппаратная часть, программное обеспечение и промышленный дизайн работают как единая система.',
    caption: 'РАЗРАБОТКА / ПРОВЕРКА / ИНТЕГРАЦИЯ',
    title: 'Инженерия', side: 'ОТ ИДЕИ<br>К УСТРОЙСТВУ', image: '/assets/engineering.webp', alt: 'Концепт электронной платы ZOND Labs',
  }
];
const heroImg = document.querySelector('.hero-art img');
const heroHeading = document.getElementById('heroTitle');
const heroDescription = document.getElementById('heroDescription');
const heroEyebrow = document.getElementById('heroEyebrow');
const heroCaption = document.getElementById('heroSlideCaption');
const heroSide = document.querySelector('.hero-side-index strong');
const heroSideText = document.getElementById('heroSideText');
const heroSideNumber = document.querySelector('.hero-side-index .dot-value');
const slideButtons = [...document.querySelectorAll('[data-slide]')];
let heroRequest = 0;
let selectedSlide = 0;
function chooseSlide(index) {
  if (index === selectedSlide) return;
  const slide = slides[index];
  if (!slide) return;
  const token = ++heroRequest;
  heroImg.classList.add('is-changing');
  loadImage(slide.image, () => {
    if (heroRequest !== token) return;
    heroImg.src = slide.image;
    document.getElementById('hero').classList.toggle('hero--bmw', index === 0);
    heroImg.alt = slide.alt;
    heroHeading.innerHTML = slide.heading; // authored static strings above; no user HTML
    heroDescription.textContent = slide.description;
    heroEyebrow.textContent = slide.eyebrow;
    heroCaption.textContent = slide.caption;
    heroSide.textContent = slide.title;
    heroSideText.innerHTML = slide.side; // authored static strings above
    heroSideNumber.dataset.dots = String(index + 1).padStart(2, '0');
    renderDots(heroSideNumber);
    slideButtons.forEach((b, i) => {
      b.classList.toggle('is-selected', i === index);
      b.setAttribute('aria-pressed', String(i === index));
    });
    selectedSlide = index;
    heroImg.classList.remove('is-changing');
  }, () => { if (token === heroRequest) heroImg.classList.remove('is-changing'); });
}
slideButtons.forEach((button, index) => {
  button.addEventListener('click', () => chooseSlide(index));
  button.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + slides.length) % slides.length;
      chooseSlide(next);
      slideButtons[next].focus();
    }
  });
});

// Native, keyboard-accessible dialogs with backdrop click and focus handling.
function installDialog(dialog, opener, closer) {
  opener.addEventListener('click', () => dialog.showModal());
  closer.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
}
const productDialog = document.getElementById('productDialog');
installDialog(productDialog, document.getElementById('detailsOpen'), document.getElementById('dialogClose'));

const searchDialog = document.getElementById('searchDialog');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const pages = [
  { name:'Главная', href:'#top', desc:'Презентация ZOND Labs', keywords:'главная компания бренд' },
  { name:'xDot', href:'#xdot', desc:'Круглый автомобильный дисплей', keywords:'дисплей экран автоэлектроника галерея персонализация wifi устройство' },
  { name:'Технологии', href:'#technology', desc:'Собственная инженерная разработка', keywords:'разработка платы электронные компоненты программное обеспечение инженерия' },
  { name:'Направления', href:'#directions', desc:'Продукты и технологические направления', keywords:'аксессуары платформа умные устройства каталог' },
  { name:'О компании', href:'#mission', desc:'Философия и подход ZOND Labs', keywords:'миссия бренд о нас' },
  { name:'Контакты', href:'#contacts', desc:'Статус каналов связи', keywords:'обратная связь поддержка контакты' }
];
function displaySearch(query) {
  const q = query.trim().toLocaleLowerCase('ru-RU');
  const found = q ? pages.filter(page => `${page.name} ${page.desc} ${page.keywords}`.toLocaleLowerCase('ru-RU').includes(q)) : pages;
  searchResults.replaceChildren();
  if (!found.length) {
    const p = document.createElement('p'); p.className='search-empty';
    p.textContent = 'Ничего не найдено. Попробуйте запрос «xDot» или «технологии».';
    searchResults.append(p);
    return;
  }
  for (const page of found) {
    const link = document.createElement('a');
    link.href=page.href;
    link.className='search-result';
    const name=document.createElement('strong'); name.textContent=page.name;
    const desc=document.createElement('span'); desc.textContent=page.desc;
    link.append(name,desc);
    link.addEventListener('click',()=>searchDialog.close());
    searchResults.append(link);
  }
}
function openSearch() { setMenu(false); searchInput.value=''; displaySearch(''); searchDialog.showModal(); searchInput.focus(); }
document.getElementById('searchOpen').addEventListener('click',openSearch);
document.getElementById('mobileSearch').addEventListener('click',openSearch);
document.getElementById('searchClose').addEventListener('click',()=>searchDialog.close());
searchDialog.addEventListener('click',e=>{if(e.target===searchDialog)searchDialog.close()});
searchInput.addEventListener('input',e=>displaySearch(e.target.value));
searchInput.addEventListener('keydown',e=>{
 if(e.key==='Enter') {const first=searchResults.querySelector('a');if(first){e.preventDefault();first.click();}}
});

// Keep the copyright year accurate without compromising the dot-matrix typography.
const copyrightYear = document.querySelector('.footer-right .dot-value');
if (copyrightYear) {
  copyrightYear.dataset.dots = String(new Date().getFullYear());
  renderDots(copyrightYear);
}

// Explicit Escape handling also covers embedded browsers that do not dispatch
// the native dialog cancel event consistently.
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  const topDialog = searchDialog.open ? searchDialog : productDialog.open ? productDialog : null;
  if (topDialog) {
    event.preventDefault();
    topDialog.close();
  }
}, true);
