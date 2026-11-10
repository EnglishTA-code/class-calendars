(function () {
  const data = window.CALENDAR;
  if (!data) return;

  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  const today = startOfDay(new Date());
  let view = new Date(today.getFullYear(), today.getMonth(), 1);

  const root = document.getElementById("app");
  root.innerHTML = `
    <header class="header">
      <p class="kicker">${escapeHtml(data.school)} · ${escapeHtml(data.year)}</p>
      <h1>${escapeHtml(data.className)} English Calendar</h1>
      <p>Important English class dates for ${escapeHtml(data.className)}.</p>
    </header>
    <section class="card" id="upcoming-card"></section>
    <section class="card">
      <div class="cal-head">
        <h2 id="month-label"></h2>
        <div class="nav">
          <button type="button" id="prev" aria-label="Previous month">‹</button>
          <button type="button" id="next" aria-label="Next month">›</button>
        </div>
      </div>
      <div class="dow">${weekdays.map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="grid" id="grid"></div>
    </section>
    <section class="card">
      <h2 id="list-title">This month</h2>
      <ul class="month-list" id="month-list"></ul>
    </section>
    <p class="footer">Last updated 11 November 2026. Times are Hong Kong time.</p>
  `;

  document.getElementById("prev").addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    render();
  });
  document.getElementById("next").addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    render();
  });

  render();

  function render() {
    const y = view.getFullYear();
    const m = view.getMonth();
    document.getElementById("month-label").textContent = `${monthNames[m]} ${y}`;
    document.getElementById("list-title").textContent = `${monthNames[m]} ${y}`;

    const upcoming = data.events
      .filter((event) => eventEnd(event) >= today)
      .sort(byStart);
    const upcomingCard = document.getElementById("upcoming-card");
    upcomingCard.innerHTML = `<h2>Up next</h2>` + (
      upcoming.length
        ? `<ul class="next-list">${upcoming.map(itemHtml).join("")}</ul>`
        : `<p class="empty">No upcoming English class events right now.</p>`
    );

    const firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; // Monday = 0
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(`<div class="day empty"></div>`);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(y, m, day);
      const key = isoDate(date);
      const events = data.events.filter((event) => event.date === key);
      const isToday = sameDay(date, today);
      cells.push(`
        <div class="day${isToday ? " today" : ""}">
          <span class="num">${day}</span>
          <div class="pills">${events.map((event) => `<span class="pill">${escapeHtml(shortTitle(event.title))}</span>`).join("")}</div>
        </div>
      `);
    }
    document.getElementById("grid").innerHTML = cells.join("");

    const monthEvents = data.events.filter((event) => {
      const d = parseDate(event.date);
      return d.getFullYear() === y && d.getMonth() === m;
    }).sort(byStart);
    document.getElementById("month-list").innerHTML = monthEvents.length
      ? monthEvents.map(itemHtml).join("")
      : `<p class="empty">No English class events in this month.</p>`;
  }

  function itemHtml(event) {
    const when = formatWhen(event);
    const bits = [];
    if (event.time) bits.push(event.time);
    if (event.location) bits.push(event.location);
    if (event.detail) bits.push(event.detail);
    return `<li class="next-item">
      <div class="when">${escapeHtml(when)}</div>
      <div>
        <div class="title">${escapeHtml(event.title)}</div>
        ${bits.length ? `<p class="meta">${escapeHtml(bits.join(" · "))}</p>` : ""}
      </div>
    </li>`;
  }

  function shortTitle(title) {
    return title
      .replace("Latte online reading (Any one reading)", "Latte reading")
      .replace("English Writing Uniform Test (S4WA UT)", "Writing UT")
      .replace("English Reading Uniform Test (S4RB UT)", "Reading UT")
      .replace("English Listening Uniform Test (S4LA UT)", "Listening UT")
      .replace("English Listening Uniform Test (S3L UT)", "Listening UT")
      .replace("English Reading Uniform Test (S3R UT)", "Reading UT")
      .replace("Deadline: upload Christmas Fair booth PPT to VLE", "PPT due")
      .replace("Christmas Fair booth pitch presentations", "Booth pitch")
      .replace("S3 Christmas Fair 中三聖誕市集", "Christmas Fair")
      .replace("3E Murder mystery activity", "Murder mystery");
  }

  function formatWhen(event) {
    const d = parseDate(event.date);
    return `${d.getDate()} ${monthNames[d.getMonth()].slice(0, 3)}`;
  }

  function parseDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function eventEnd(event) {
    const d = parseDate(event.date);
    return startOfDay(d);
  }

  function byStart(a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return (a.sortTime || "") < (b.sortTime || "") ? -1 : 1;
  }

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function isoDate(d) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
})();
