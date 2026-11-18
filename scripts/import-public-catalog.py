"""Publish only public MAX metadata, never arbitrary columns from the owner's tables."""
import argparse,json,re
from pathlib import Path
from urllib.parse import urlsplit

def normalize(value):
 parsed=urlsplit(value)
 if parsed.scheme!='https' or parsed.netloc.lower()!='max.ru':raise ValueError('Not a MAX URL')
 path=parsed.path.rstrip('/')
 if not re.fullmatch(r'/(?:join/[A-Za-z0-9_-]+|[A-Za-z0-9_-]+)',path):raise ValueError('Not a profile URL')
 return 'https://max.ru'+(path if path.startswith('/join/') else path.lower())

def sources(value):
 result=[]
 for item in str(value or '').split(';'):
  item=item.strip();parsed=urlsplit(item)
  if parsed.scheme=='https' and parsed.hostname in {'max.ru','maxframe.ru','listmax.ru'}:result.append(item)
 return result

def build(links,checked,avatars):
 records={}
 for row in links+checked:
  url=normalize(row['url'])
  record=records.setdefault(url,{'url':url,'name':'','description':'','members':None,'type':'bot' if url.endswith('_bot') else 'channel','avatar':'','sources':[],'checkedAt':''})
  for key,label in [('name','Название канала/бота'),('description','Описание канала'),('checkedAt','Проверено')]:
   if row.get(label):record[key]=str(row[label]).strip()
  count=row.get('Участников')
  if type(count) is int and count>=0:record['members']=count
  if sources(row.get('Источник проверки')):record['sources']=sources(row['Источник проверки'])
  if not record['sources']:record['sources']=sources(row.get('source'))
 for url,record in records.items():
  avatar=avatars.get(url,'');parsed=urlsplit(avatar)
  if parsed.scheme=='https' and parsed.hostname in {'maxframe.ru','i.oneme.ru','listmax.ru'}:record['avatar']=avatar
 return {'updatedAt':'2026-11-18','metadataCheckedAt':'2026-11-15','channels':list(records.values())}

def main():
 parser=argparse.ArgumentParser();parser.add_argument('--links',required=True);parser.add_argument('--checked',required=True);parser.add_argument('--avatars',required=True);parser.add_argument('--output',default='public/data/channels.json');args=parser.parse_args()
 links=json.loads(Path(args.links).read_text())['rows'];checked=json.loads(Path(args.checked).read_text())['rows'];avatars=json.loads(Path(args.avatars).read_text())
 result=build(links,checked,avatars);out=Path(args.output);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
 print(json.dumps({'channels':len(result['channels']),'names':sum(bool(x['name']) for x in result['channels']),'descriptions':sum(bool(x['description']) for x in result['channels']),'avatars':sum(bool(x['avatar']) for x in result['channels'])}))
if __name__=='__main__':main()
