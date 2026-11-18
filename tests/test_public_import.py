import importlib.util
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def module(name):
 spec=importlib.util.spec_from_file_location(name,ROOT/'scripts'/name)
 value=importlib.util.module_from_spec(spec);spec.loader.exec_module(value);return value
build=module('build-public-pages.py');data=module('import-public-catalog.py')
class PublicCatalogTests(unittest.TestCase):
 def test_removes_streamed_hidden_payload_without_losing_visible_layout(self):
  raw='<header>Keep</header><main>Old</main><div hidden id="S:0"><div>hidden</div></div><footer>Keep</footer>'
  self.assertEqual(build.strip_fragments(raw),'<header>Keep</header><main>Old</main><footer>Keep</footer>')
 def test_public_overlay_is_idempotent(self):
  raw='<html><head></head><body><main>Old</main></body></html>'
  first=build.update_html(raw,build.catalog_body(),widget=True)
  self.assertEqual(build.update_html(first,build.catalog_body(),widget=True),first)
 def test_import_whitelists_data_deduplicates_and_keeps_zero(self):
  links=[{'url':'https://max.ru/RT','source':'https://maxframe.ru/channels/'}]
  checked=[{'url':'https://max.ru/rt','Название канала/бота':'RT','Описание канала':'News','Участников':0,'private_note':'do not publish','Источник проверки':'https://max.ru/rt'}]
  result=data.build(links,checked,{'https://max.ru/rt':'javascript:bad'})['channels']
  self.assertEqual(len(result),1);self.assertEqual(result[0]['members'],0);self.assertEqual(result[0]['avatar'],'')
  self.assertNotIn('private_note',result[0])
 def test_page_overlay_enables_real_widget_and_preserves_assets(self):
  raw='<html><head></head><body><header>Keep</header><main class="shell">Old</main><script defer src="/chicks.js"></script></body></html>'
  result=build.update_html(raw,build.catalog_body(),widget=True)
  self.assertIn('data-public-catalog',result);self.assertIn('catalog-boot.mjs',result);self.assertIn('/chicks.js',result)
  self.assertNotIn('>Old<',result)
if __name__=='__main__':unittest.main()
