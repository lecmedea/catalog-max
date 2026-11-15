// Build the static-site animation from the same engine used by React.
const fs = require('node:fs');
const ts = require('typescript');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
let engine = fs.readFileSync(path.join(root, 'src/components/chick-stage.tsx'), 'utf8');
engine = engine.replace('"use client";', '').replace(/import .*?from "react";\n/, '');
const start = 'export function ChickStage({ ids }: { ids: string[] }) {\n  const ref = useRef<HTMLCanvasElement>(null);\n  useEffect(() => {\n    const canvas = ref.current;\n    if (!canvas) return;';
if (!engine.includes(start)) throw Error('ChickStage initialization changed; update the static adapter.');
engine = engine.replace(start, 'function startChickStage(canvas: HTMLCanvasElement, ids: string[]) {');
const end = '  }, [ids]);\n  return <canvas ref={ref} className="chick-stage" aria-hidden="true" />;\n}';
if (!engine.includes(end)) throw Error('ChickStage cleanup changed; update the static adapter.');
engine = engine.replace(end, '}').replace('`/chicks/chick-${id}.png`', '`/catalog-max/chicks/chick-${id}.png`');
let routes = fs.readFileSync(path.join(root, 'src/components/chicks.tsx'), 'utf8');
routes = routes.slice(routes.indexOf('const FLOCKS'), routes.indexOf('export function Chicks'));
const boot = `
const route = location.pathname.replace(/^\\/catalog-max/, '').replace(/\\/$/, '') || '/';
const ids = flockFor(route);
if (ids.length) {
 const canvas = document.querySelector('canvas.chick-stage') || document.createElement('canvas');
 canvas.className = 'chick-stage'; canvas.setAttribute('aria-hidden', 'true');
 if (!canvas.isConnected) document.body.append(canvas);
 const stop = startChickStage(canvas, ids);
 window.addEventListener('pagehide', () => stop?.(), {once:true});
}
`;
const result = ts.transpileModule(engine + routes + boot, {compilerOptions:{target:ts.ScriptTarget.ES2020, module:ts.ModuleKind.None}});
fs.writeFileSync(path.join(root,'pages-site/chicks-animation.js'), result.outputText);
