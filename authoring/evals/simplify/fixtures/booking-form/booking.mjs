import { bookingField } from './field.mjs';

const form = document.querySelector('#booking');
const saved = JSON.parse(localStorage.getItem('booking') || '{}');
form.prepend(bookingField('name', 'Customer name', 'text', saved.name));
form.addEventListener('submit', event => {
  event.preventDefault();
  localStorage.setItem('booking', JSON.stringify(Object.fromEntries(new FormData(form))));
  document.querySelector('output').textContent = 'Saved';
});
