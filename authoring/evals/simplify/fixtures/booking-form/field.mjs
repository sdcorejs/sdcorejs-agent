export function bookingField(name, label, type = 'text', value = '') {
  const wrapper = document.createElement('label');
  wrapper.textContent = label;
  const input = document.createElement('input');
  Object.assign(input, { name, type, value });
  wrapper.append(input);
  return wrapper;
}
