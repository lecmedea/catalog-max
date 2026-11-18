export function normalizeLink(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.host !== 'max.ru' || url.username || url.password) return null;
    const path = url.pathname.replace(/\/$/, '');
    if (!/^\/(?:join\/[A-Za-z0-9_-]+|[A-Za-z0-9_-]+)$/.test(path)) return null;
    return 'https://max.ru' + (path.startsWith('/join/') ? path : path.toLowerCase());
  } catch { return null; }
}

function bound(value) {
  if (value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}
function matchesMembers(row, filters) {
  const min = bound(filters.min), max = bound(filters.max);
  if (min === null && max === null) return true;
  if (row.members === null) return false;
  return (min === null || row.members >= min) && (max === null || row.members <= max);
}
function matchesMetadata(row, filters) {
  if (filters.description === 'yes' && !row.description) return false;
  if (filters.description === 'no' && row.description) return false;
  if (filters.avatar === 'yes' && !row.avatar) return false;
  if (filters.avatar === 'no' && row.avatar) return false;
  return true;
}
function matchesText(row, query) {
  return `${row.name}\n${row.description}\n${row.url}`.toLocaleLowerCase('ru').includes(query);
}
function compareMembers(a, b, ascending) {
  if (a.members === null) return b.members === null ? 0 : 1;
  if (b.members === null) return -1;
  return ascending ? a.members - b.members : b.members - a.members;
}
function compareRows(a, b, sort) {
  if (sort === 'name') return a.name.localeCompare(b.name, 'ru') || a.url.localeCompare(b.url);
  return compareMembers(a, b, sort === 'members-asc') || a.name.localeCompare(b.name, 'ru') || a.url.localeCompare(b.url);
}
export function filterChannels(rows, filters = {}) {
  const query = String(filters.q || '').trim().toLocaleLowerCase('ru');
  return rows.filter(row => matchesText(row, query))
    .filter(row => !filters.type || row.type === filters.type)
    .filter(row => matchesMetadata(row, filters))
    .filter(row => matchesMembers(row, filters))
    .sort((a, b) => compareRows(a, b, filters.sort));
}
export function pageOf(rows, requested, size = 25) {
  const count = Math.max(1, Math.floor(Number(size)) || 25);
  const pages = Math.max(1, Math.ceil(rows.length / count));
  const page = Math.max(1, Math.min(pages, Math.floor(Number(requested)) || 1));
  return {items:rows.slice((page - 1) * count, page * count), page, pages};
}
export function csvOf(rows) {
  const cell = value => '"' + String(value ?? '').replace(/^[=+\-@\t\r]/, match => "'" + match).replaceAll('"', '""') + '"';
  const values = [['Ссылка','Название','Описание','Участников'], ...rows.map(row => [row.url,row.name,row.description,row.members])];
  return '\ufeff' + values.map(row => row.map(cell).join(',')).join('\r\n');
}
