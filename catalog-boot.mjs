import {mountCatalog} from './catalog-widget.mjs';
const root=document.querySelector('[data-public-catalog]');
if(root) {
  try {
    const response=await fetch(new URL('./data/channels.json',import.meta.url));
    if(!response.ok)throw new Error('catalog unavailable');
    const data=await response.json();mountCatalog(root,data.channels);
  }catch{
    root.textContent='Не удалось загрузить каталог. Обновите страницу или попробуйте позже.';
  }
}
