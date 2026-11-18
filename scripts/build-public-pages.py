"""Overlay the public catalog onto an existing Pages tree; leave other routes/assets intact."""
import argparse,json,re,shutil
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

class Fragments(HTMLParser):
 def __init__(self,raw):
  super().__init__(convert_charrefs=False);self.raw=raw;self.lines=[0];self.stack=[];self.spans=[]
  for line in raw.splitlines(keepends=True):self.lines.append(self.lines[-1]+len(line))
 def position_offset(self):
  line,column=self.getpos();return self.lines[line-1]+column
 def handle_starttag(self,tag,attrs):
  if tag=='div':self.stack.append((self.position_offset(),dict(attrs).get('id','').startswith('S:')))
 def handle_endtag(self,tag):
  if tag=='div' and self.stack:
   start,payload=self.stack.pop()
   if payload:self.spans.append((start,self.position_offset()+len('</div>')))

def strip_fragments(raw):
 parser=Fragments(raw);parser.feed(raw)
 spans=[]
 for start,end in sorted(parser.spans,key=lambda item:(item[0],-item[1])):
  if not spans or start>=spans[-1][1]:spans.append((start,end))
 for start,end in reversed(spans):raw=raw[:start]+raw[end:]
 return raw

def catalog_body(rating=False):
 title='Рейтинг каналов MAX' if rating else 'Каталог каналов MAX'
 return f'<h1 class="catalog-heading">{title}</h1><p class="catalog-intro">Каналы и боты в одной таблице. Найдите нужную тему, сравните число участников и перейдите в MAX.</p><p class="catalog-editorial">Каталог пополняет редакция. Данные проверены 15 ноября 2026 года; счётчики могут меняться. Если сведения недоступны, это отмечено в таблице.</p><div data-public-catalog><p role="status">Загружаем таблицу каналов…</p><noscript>Для поиска и фильтров включите JavaScript.</noscript></div>'

def home_body(data):
 count=len(data['channels']);described=sum(bool(row['description']) for row in data['channels'])
 return f'<section class="hero"><div><h1>Каталог каналов MAX</h1><p class="lede">{count} каналов и ботов в одной таблице: ссылки, названия, описания и число участников.</p><form class="row" action="/catalog-max/catalog/" method="get"><label style="flex:1">Поиск по каталогу<input name="q" type="search" placeholder="Название, тема или ссылка"></label><button class="btn btn-primary" type="submit">Найти</button></form></div><aside class="panel"><h2>Найдите свой канал</h2><p>Отбирайте по числу участников, наличию описания и аватарки. Сортируйте и сохраняйте свою выборку.</p><a class="btn btn-primary" href="/catalog-max/catalog/">Открыть таблицу</a></aside></section><section class="panel"><h2>Каталог пополняется</h2><p>У {described} записей есть полученное описание. Если название или описание ещё недоступны, мы показываем это прямо в таблице. Ссылки сохраняются в каталоге.</p><p>Записи пока добавляет редакция. Вход для просмотра и поиска не нужен.</p><a class="btn" href="/catalog-max/catalog/?description=yes">Каналы с описанием</a></section>'

def update_html(raw,body=None,widget=False):
 raw=strip_fragments(raw)
 notice='<aside class="catalog-publishing-note" style="padding:10px 20px;background:#fff1a8;border-bottom:2px solid #222;text-align:center">Каталог доступен без входа. Записи добавляет редакция.</aside>'
 raw=re.sub(r'<aside style="padding:12px 20px;background:#fff1a8;.*?</aside>',notice,raw,count=1,flags=re.S)
 raw=raw.replace('<a class="btn btn-primary" href="/catalog-max/auth/login">Войти</a>','')
 if body is not None:raw=re.sub(r'(<main\b[^>]*>).*?(</main>)',lambda match:match[1]+body+match[2],raw,count=1,flags=re.S)
 if widget:
  if '/catalog-max/catalog-table.css' not in raw:raw=raw.replace('</head>','<link rel="stylesheet" href="/catalog-max/catalog-table.css"></head>')
  if '/catalog-max/catalog-boot.mjs' not in raw:raw=raw.replace('</body>','<script type="module" src="/catalog-max/catalog-boot.mjs"></script></body>')
 return raw

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--site-dir',required=True);args=parser.parse_args();site=Path(args.site_dir)
 data=json.loads((ROOT/'public/data/channels.json').read_text())
 for target in site.rglob('*.html'):
  relative=target.relative_to(site).as_posix();body=None;widget=False
  if relative=='catalog/index.html':body=catalog_body();widget=True
  elif relative=='rating/index.html':body=catalog_body(rating=True);widget=True
  elif relative=='index.html':body=home_body(data)
  # Other routes keep their original bodies, including any streamed contents.
  if body is None:
   text=target.read_text();text=re.sub(r'<aside style="padding:12px 20px;background:#fff1a8;.*?</aside>','<aside style="padding:10px 20px;background:#fff1a8;border-bottom:2px solid #222;text-align:center">Каталог доступен без входа. Записи добавляет редакция.</aside>',text,count=1,flags=re.S)
   text=text.replace('<a class="btn btn-primary" href="/catalog-max/auth/login">Войти</a>','');target.write_text(text)
  else:target.write_text(update_html(target.read_text(),body,widget))
 for name in ['catalog-model.mjs','catalog-widget.mjs','catalog-boot.mjs','catalog-table.css']:
  shutil.copy2(ROOT/'public'/name,site/name)
 (site/'data').mkdir(exist_ok=True);shutil.copy2(ROOT/'public/data/channels.json',site/'data/channels.json')
 print(json.dumps({'channels':len(data['channels']),'site':str(site)}))
if __name__=='__main__':main()
