// What moves on the page: parts coming into view as they are scrolled to, the year's
// dots filling in, a habit counting up to done, and two inhabitants walking the dark
// band, as they walk along the bottom of the app.

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

  // The walk: six frames a step, along the line and back.
  const way = document.getElementById('walkway');
  if (!way) return;
  const walkers = [...way.querySelectorAll('.walker')].map((el, n) => ({
    el,
    who: el.dataset.who,
    x: n === 0 ? 0.1 : 0.72,
    dir: n === 0 ? 1 : -1,
    speed: n === 0 ? 0.03 : 0.045,
  }));
  for (const w of walkers) for (let f = 0; f < 6; f++) new Image().src = `img/walk/${w.who}_${f}.svg`;
  const place = (w) => {
    w.el.style.transform = `translateX(${w.x * (way.clientWidth - w.el.clientWidth)}px) scaleX(${w.dir})`;
  };
  walkers.forEach(place);
  if (reduced) return;
  let frame = 0;
  let last = performance.now();
  let lastStep = last;
  const tick = (time) => {
    const dt = Math.min(0.05, (time - last) / 1000);
    last = time;
    for (const w of walkers) {
      w.x += w.dir * w.speed * dt;
      if (w.x > 1) { w.x = 1; w.dir = -1; }
      if (w.x < 0) { w.x = 0; w.dir = 1; }
      place(w);
    }
    if (time - lastStep > 125) {
      lastStep = time;
      frame = (frame + 1) % 6;
      for (const w of walkers) w.el.src = `img/walk/${w.who}_${frame}.svg`;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// The top bar gets an edge once the page has scrolled under it.
(() => {
  const bar = document.getElementById('topbar');
  if (!bar) return;
  const mark = () => bar.classList.toggle('scrolled', scrollY > 8);
  addEventListener('scroll', mark, { passive: true });
  mark();
})();
