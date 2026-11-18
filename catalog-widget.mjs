import {filterChannels, pageOf, csvOf} from './catalog-model.mjs';

const number = new Intl.NumberFormat('ru-RU');
const labels = {q:'Поиск по названию, описанию или ссылке',type:'Тип',description:'Описание',avatar:'Аватарка',min:'Участников от',max:'Участников до',sort:'Сортировка',size:'Строк на странице'};
const defaults = {q:'',type:'',description:'',avatar:'',min:'',max:'',sort:'members-desc',size:'25'};
function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
function link(text, url, className) {
  const node = element('a', className, text);
  node.href = url; node.target = '_blank'; node.rel = 'noopener noreferrer';
  return node;
}
function field(name, choices) {
  const label = element('label','catalog-filter',labels[name]);
  const input = element(choices ? 'select' : 'input');
  input.name = name;
  if (choices) for (const [value,title] of choices) input.add(new Option(title,value));
  else if (name === 'q') {input.type='search';input.placeholder='Например, нейросети или новости';}
  else {input.type='number';input.min='0';input.step='1';input.inputMode='numeric';}
  input.value = defaults[name];label.append(input);return label;
}
function avatar(row) {
  const box=element('div','catalog-avatar');
  box.append(element('span','catalog-initial',(row.name || '#').slice(0,1).toLocaleUpperCase('ru')));
  if (!row.avatar) return box;
  const image=element('img');image.src=row.avatar;image.alt='';image.loading='lazy';image.width=48;image.height=48;image.referrerPolicy='no-referrer';
  image.addEventListener('error',()=>image.remove(),{once:true});box.append(image);return box;
}
function description(row) {
  const cell=element('td','catalog-description');
  if (!row.description) cell.append(element('span','catalog-missing','Описание пока не получено'));
  else if (row.description.length <= 180) cell.append(element('p','',row.description));
  else {
    const details=element('details');details.append(element('summary','',row.description.slice(0,150)+'…'),element('p','',row.description));cell.append(details);
  }
  if (row.sources?.length) {
    const sources=element('div','catalog-sources');
    row.sources.forEach((source,index)=>sources.append(link(index ? 'Ещё источник' : 'Источник данных',source)));
    cell.append(sources);
  }
  return cell;
}
function tableRow(row) {
  const tr=element('tr');
  const picture=element('td','catalog-picture');picture.append(avatar(row));tr.append(picture);
  const name=element('td','catalog-name');name.append(link(row.name || 'Название уточняется',row.url,'catalog-name-link'));
  name.append(element('small','catalog-kind',row.type==='bot'?'Бот':'Канал'));
  name.append(link(row.url.replace('https://',''),row.url,'catalog-address'));tr.append(name,description(row));
  tr.append(element('td','catalog-members',row.members===null?'Нет данных':number.format(row.members)));
  const action=element('td','catalog-open');action.append(link('Открыть MAX',row.url,'btn'));tr.append(action);return tr;
}
function buildForm() {
  const form=element('form','catalog-controls');form.setAttribute('role','search');form.setAttribute('aria-label','Фильтры каталога');
  form.append(field('q'),field('type',[['','Каналы и боты'],['channel','Каналы'],['bot','Боты']]),field('description',[['','Все описания'],['yes','С описанием'],['no','Без описания']]),field('avatar',[['','Все записи'],['yes','С аватаркой'],['no','Без аватарки']]),field('min'),field('max'),field('sort',[['members-desc','Больше участников'],['members-asc','Меньше участников'],['name','По названию']]),field('size',[['25','25'],['50','50'],['100','100']]));
  const reset=element('button','btn','Сбросить');reset.type='reset';form.append(reset);return form;
}
function download(rows) {
  const url=URL.createObjectURL(new Blob([csvOf(rows)],{type:'text/csv;charset=utf-8'}));
  const a=element('a');a.href=url;a.download='catalog-max.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function syncUrl(form,page) {
  const params=new URLSearchParams();
  for(const [key,value] of new FormData(form)) if(value!==defaults[key]) params.set(key,String(value));
  if(page>1)params.set('page',String(page));
  history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));
}
function restoreForm(form,params) {
  for(const key of Object.keys(defaults)) {
    const input=form.elements.namedItem(key),value=params.get(key);
    if(value!==null)input.value=value;
    if(input.tagName==='SELECT'&&!input.value)input.value=defaults[key];
  }
}
function navigationButton(text,disabled,action) {
  const button=element('button','btn',text);button.type='button';button.disabled=disabled;button.addEventListener('click',action);return button;
}
export function mountCatalog(root,rows) {
  root.replaceChildren();
  const form=buildForm();root.append(form);
  const toolbar=element('div','catalog-toolbar');const count=element('p');count.setAttribute('role','status');count.setAttribute('aria-live','polite');
  const csv=element('button','btn','Скачать выборку CSV');csv.type='button';toolbar.append(count,csv);root.append(toolbar);
  const wrap=element('div','catalog-table-wrap');wrap.tabIndex=0;wrap.setAttribute('aria-label','Таблица каналов, прокручивается по горизонтали');
  const table=element('table','catalog-table'),head=element('thead'),headRow=element('tr'),body=element('tbody');
  for(const title of ['Аватар','Название и ссылка','Описание','Участников','']) {const th=element('th','',title);th.scope='col';headRow.append(th);}
  head.append(headRow);table.append(head,body);wrap.append(table);root.append(wrap);
  const pager=element('nav','catalog-pager');pager.setAttribute('aria-label','Страницы каталога');root.append(pager);
  let page=Number(new URLSearchParams(location.search).get('page'))||1, filtered=[],timer;
  restoreForm(form,new URLSearchParams(location.search));
  function render() {
    const filters=Object.fromEntries(new FormData(form));filtered=filterChannels(rows,filters);
    const result=pageOf(filtered,page,Number(filters.size));page=result.page;
    count.textContent=`Найдено ${number.format(filtered.length)} из ${number.format(rows.length)}`;
    body.replaceChildren(...result.items.map(tableRow));
    if(!result.items.length) {const tr=element('tr'),td=element('td','catalog-empty','По этим условиям ничего не найдено. Измените запрос или сбросьте фильтры.');td.colSpan=5;tr.append(td);body.append(tr);}
    pager.replaceChildren(navigationButton('Назад',page===1,()=>{page--;render();wrap.scrollIntoView({block:'start'});}),element('span','',`Страница ${page} из ${result.pages}`),navigationButton('Дальше',page===result.pages,()=>{page++;render();wrap.scrollIntoView({block:'start'});}));
    csv.disabled=!filtered.length;syncUrl(form,page);
  }
  const change=()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;render();},120);};
  form.addEventListener('input',change);form.addEventListener('change',change);
  form.addEventListener('submit',event=>{event.preventDefault();page=1;render();});
  form.addEventListener('reset',()=>setTimeout(()=>{page=1;render();},0));
  csv.addEventListener('click',()=>download(filtered));render();
  return ()=>{clearTimeout(timer);root.replaceChildren();};
}
