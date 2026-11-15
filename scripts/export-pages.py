"""Export the public, unconfigured catalog interface for GitHub Pages.
No server actions, login submission or backend is claimed in this version.
"""
import re,shutil,urllib.request,json,subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'pages-site'
PREFIX='/catalog-max'
ROUTES=['/','/catalog','/rating','/platforms','/instructions','/contacts','/auth/login','/auth/register','/auth/reset-password']

def transform(raw):
 raw=re.sub(r'<script\b[^>]*>.*?</script>','',raw,flags=re.S|re.I)
 raw=re.sub(r'<link\b[^>]*(?:as="script"|rel="modulepreload")[^>]*>','',raw)
 raw=re.sub(r'\s(?:action|method)="[^"]*"','',raw)
 raw=raw.replace('<form','<form action="#" data-static-form')
 raw=re.sub(r'<button\b','<button disabled aria-disabled="true"',raw)
 for attr in ['href','src','action']:
  raw=re.sub(r'('+attr+r'=")/(?!/)',r'\1'+PREFIX+'/',raw)
 notice='<aside style="padding:12px 20px;background:#fff1a8;border-bottom:2px solid #222;text-align:center">Статическая версия каталога. Регистрация, поиск по базе и личный кабинет появятся после подключения базы данных.</aside>'
 return raw.replace('</header>','</header>'+notice,1).replace('</body>', '<script defer src="/catalog-max/chicks-animation.js"></script></body>')

def main():
 if OUT.exists():shutil.rmtree(OUT)
 OUT.mkdir()
 for route in ROUTES:
  with urllib.request.urlopen('http://127.0.0.1:4317'+route,timeout=30) as response:raw=response.read().decode()
  target=OUT/route.strip('/')/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(transform(raw))
 for alias,target in [('login','auth/login'),('register','auth/register')]:
  dest=OUT/alias/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes((OUT/target/'index.html').read_bytes())
 for alias in ['admin','admin/categories','admin/platforms','admin/users','dashboard/channels','dashboard/channels/new','dashboard/favorites','dashboard/profile','auth/update-password']:
  dest=OUT/alias/'index.html';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes((OUT/'auth/login/index.html').read_bytes())
 for source in (ROOT/'.next/static').rglob('*'):
  if source.suffix not in {'.css','.ttf','.woff','.woff2'}:continue
  dest=OUT/'_next/static'/source.relative_to(ROOT/'.next/static');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,dest)
 shutil.copytree(ROOT/'public/chicks',OUT/'chicks')
 for name in ['favicon.ico','icon.svg']:
  source=ROOT/'src/app'/name
  if source.exists():shutil.copyfile(source,OUT/name)
 subprocess.run(['node',str(ROOT/'scripts/build-pages-chicks.cjs')],check=True)
 (OUT/'.nojekyll').write_text('')
 (OUT/'404.html').write_bytes((OUT/'index.html').read_bytes())
 print(json.dumps({'pages':len(ROUTES)+2,'files':len([p for p in OUT.rglob('*') if p.is_file()])}))

if __name__=='__main__':main()
