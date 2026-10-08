// What moves on the page: parts coming into view as they are scrolled to, the year's
// dots filling in, and a habit counting up to done. The inhabitants walking the dark band
// are CSS alone (see .walker).

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const colours = ['#FF6B5E', '#FFA23A', '#E7B92F', '#8DBF3F', '#3FB27F', '#2FB5B0', '#4AA8F0', '#8B6CF0', '#F06FB3', '#B07A4F'];
  // 365 in most years, 366 when Feb rolls over to the 29th instead of spilling into March.
  const yearLength = (year) => (new Date(year, 1, 29).getDate() === 29 ? 366 : 365);
  // How many days into [date]'s year we are, Jan 1st being day 0.
  const dayOfYear = (date) => Math.floor((date - new Date(date.getFullYear(), 0, 1)) / 864e5);
  // A tiny, seeded, repeatable "random": the same seed always draws the same days.
  const lcg = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const now = new Date();
  const today = dayOfYear(now);
  const length = yearLength(now.getFullYear());

  // Calls [then] once [el] is well in view, or at once without an observer.
  const whenSeen = (el, then) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) return then();
    const watch = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        watch.disconnect();
        then();
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    watch.observe(el);
  };

  document.querySelectorAll('.reveal').forEach((el) => whenSeen(el, () => el.classList.add('in')));

  // The year in dots: today's date, the days so far filling in one after another.
  const dots = document.getElementById('dots');
  if (dots) {
    document.getElementById('year-now').textContent = `in ${now.getFullYear()}`;
    document.getElementById('left').textContent = `${length - today}`;
    const random = lcg(11);
    const cells = [];
    for (let i = 0; i < length; i++) {
      const dot = document.createElement('i');
      if (i === today) dot.className = 'today';
      dots.appendChild(dot);
      if (i <= today && random() > 0.12) cells.push([dot, colours[Math.floor(random() * colours.length)]]);
    }
    const fill = () => cells.forEach(([dot, colour]) => { dot.style.background = colour; dot.classList.add('on'); });
    whenSeen(dots, () => {
      if (reduced) return fill();
      cells.forEach(([dot, colour], n) => setTimeout(() => { dot.style.background = colour; dot.classList.add('on'); }, n * 6));
    });
  }

  // The year widget's dots: the days so far in their colors, the rest faint.
  const wyear = document.getElementById('wyear');
  if (wyear) {
    const random = lcg(5);
    const html = [];
    for (let i = 0; i < length; i++) {
      const colour = i <= today && random() > 0.15 ? colours[Math.floor(random() * colours.length)] : '';
      html.push(colour ? `<i style="background:${colour}"></i>` : '<i></i>');
    }
    wyear.innerHTML = html.join('');
    // The widget's own foot, kept in step with the dots above it instead of staying fixed.
    document.getElementById('wyear-label').textContent = `${now.getFullYear()}`;
    document.getElementById('wyear-left').textContent = `${length - today} days left`;
  }

  // A habit three times a month, counted up to done.
  const clean = document.getElementById('clean');
  if (clean) {
    const count = clean.querySelector('.count');
    whenSeen(clean, () => {
      let n = 0;
      const step = () => {
        n += 1;
        count.textContent = n < 3 ? `${n}/3` : 'Done';
        if (n >= 3) return clean.classList.add('done');
        setTimeout(step, 700);
      };
      setTimeout(step, reduced ? 0 : 500);
    });
  }
})();

// The top bar gets an edge once the page has scrolled under it.
(() => {
  const bar = document.getElementById('topbar');
  if (!bar) return;
  const mark = () => bar.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', mark, { passive: true });
  mark();
})();

// A tilted phone's body: thin slabs stacked behind its screen, each a step further back,
// drawn in as a rounded titanium edge would be (narrower and darker at the faces, lit
// across the middle), with its side buttons standing out on the edge turned to us.
document.querySelectorAll('.phone.tilt').forEach((phone) => {
  const depth = 26;
  for (let i = 1; i <= depth; i++) {
    const t = (i - 0.5) / depth;
    const bulge = Math.sqrt(1 - (2 * t - 1) ** 2);
    const slab = document.createElement('i');
    slab.className = 'edge';
    slab.style.transform = `translateZ(${-i}px)`;
    slab.style.inset = `${(1 - bulge) * 4}px`;
    const dark = 12 + bulge * 10;
    const light = 30 + bulge * 42;
    slab.style.background = `linear-gradient(105deg, hsl(230 5% ${dark}%) 0%, hsl(230 5% ${dark + 8}%) 55%, hsl(230 6% ${light}%) 82%, hsl(230 7% ${light + 14}%) 92%, hsl(230 5% ${light - 6}%) 100%)`;
    phone.prepend(slab);
  }
  for (const [top, height] of [['24%', '11%'], ['58%', '7%']]) {
    for (let z = 8; z <= 18; z++) {
      const button = document.createElement('i');
      button.className = 'button';
      Object.assign(button.style, { top, height, transform: `translateZ(${-z}px)` });
      phone.prepend(button);
    }
  }
  const glass = document.createElement('i');
  glass.className = 'glass';
  phone.append(glass);
});
