import {mountCatalog} from './catalog-widget.mjs';
const root=document.querySelector('[data-public-bots]');
if(root) {
  try {
    const response=await fetch(new URL('./data/bots.json',import.meta.url));
    if(!response.ok)throw new Error('catalog unavailable');
    const data=await response.json();
    mountCatalog(root,data.channels);
  }catch{
    root.textContent='Не удалось загрузить каталог ботов. Обновите страницу или попробуйте позже.';
  }
}
