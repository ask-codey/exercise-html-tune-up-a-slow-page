// countdown.js: ready-made for this exercise. You don't need to read it or change it.
// It finds the paragraph with id="countdown" and shows how long it is until the next
// Friday showtime at 7:30 p.m., then updates it every minute.

const countdown = document.querySelector('#countdown');

function plural(count, word) {
  return count === 1 ? `${count} ${word}` : `${count} ${word}s`;
}

function nextShowtime(now) {
  const show = new Date(now);
  show.setHours(19, 30, 0, 0);
  show.setDate(show.getDate() + ((5 - now.getDay() + 7) % 7));
  if (show <= now) {
    show.setDate(show.getDate() + 7);
  }
  return show;
}

function update() {
  const now = new Date();
  const minutesLeft = Math.ceil((nextShowtime(now) - now) / 60000);
  const days = Math.floor(minutesLeft / 1440);
  const hours = Math.floor((minutesLeft % 1440) / 60);
  const minutes = minutesLeft % 60;
  countdown.textContent = `The next film starts in ${plural(days, 'day')}, ${plural(hours, 'hour')} and ${plural(minutes, 'minute')}.`;
}

update();
setInterval(update, 60000);
