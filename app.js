// The hero's year: a page of the app's doodles, one per day so far, each in the colour
// of a habit, drawing themselves in day by day; the days to come as dots. And under it
// two inhabitants walking the ruled line, as they do along the bottom of the app.

(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The habit colours of the app's palette.
  const colours = ['#FF6B5E', '#FFA23A', '#E7B92F', '#8DBF3F', '#3FB27F', '#2FB5B0', '#4AA8F0', '#8B6CF0', '#F06FB3', '#B07A4F'];
  const doodles = 120;

  const days = document.getElementById('days');
  if (days) {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const yearLength = new Date(now.getFullYear(), 1, 29).getDate() === 29 ? 366 : 365;
    const today = Math.floor((now - start) / 864e5) + 1;
    const left = yearLength - today + 1;
    const leftLabel = document.getElementById('days-left');
    if (leftLabel) leftLabel.textContent = `${left} days left`;

    // As many days as fill the page, today about three quarters of the way down it.
    const cells = 140;
    const todayAt = Math.min(cells - 30, Math.max(40, Math.round(cells * 0.72)));
    // A fixed hand of doodles and colours, so the page reads the same on every visit.
    let seed = 7;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const html = [];
    for (let i = 0; i < cells; i++) {
      if (i > todayAt) {
        html.push('<span class="dot ahead"></span>');
      } else if (i !== todayAt && random() < 0.08) {
        // Now and then a day left unwritten.
        html.push('<span class="dot"></span>');
      } else {
        const doodle = Math.floor(random() * doodles);
        const colour = colours[Math.floor(random() * colours.length)];
        const cls = i === todayAt ? 'drawn today' : 'drawn';
        html.push(
          `<span class="${cls}" style="--i:${i}"><svg viewBox="0 0 40 40" style="stroke:${colour}"><use href="img/doodles.svg#d${doodle}"/></svg></span>`,
        );
      }
    }
    days.innerHTML = html.join('');
  }

  // The inhabitants' walk: six frames a step, along the line and back.
  const margin = document.getElementById('margin');
  if (!margin) return;
  const walkers = [...margin.querySelectorAll('.walker')].map((el, n) => ({
    el,
    who: el.dataset.who,
    x: n === 0 ? 0.12 : 0.7,
    dir: n === 0 ? 1 : -1,
    speed: n === 0 ? 0.035 : 0.05,
  }));
  // Load every frame up front, so a step never waits for one.
  for (const w of walkers) for (let f = 0; f < 6; f++) new Image().src = `img/walk/${w.who}_${f}.svg`;

  const place = (w) => {
    const width = margin.clientWidth - w.el.clientWidth;
    w.el.style.transform = `translateX(${w.x * width}px) scaleX(${w.dir})`;
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
