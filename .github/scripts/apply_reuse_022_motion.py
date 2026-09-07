from pathlib import Path

p = Path('design-system/components/reuse-confidence.css')
c = p.read_text()

old = 'grid-template-columns:minmax(0,1fr) 28px minmax(0,1fr) 28px minmax(0,1fr) 28px minmax(0,1fr);'
new = 'grid-template-columns:minmax(0,1fr) 30.8px minmax(0,1fr) 30.8px minmax(0,1fr) 30.8px minmax(0,1fr);'
if old not in c:
    raise SystemExit('desktop 02.2 spacing marker missing')
c = c.replace(old, new, 1)

old = 'font:100 30px/1 var(--hm-font-en);'
new = 'font:100 31.5px/1 var(--hm-font-en);'
if old not in c:
    raise SystemExit('02.2 arrow font marker missing')
c = c.replace(old, new, 1)

old = '''html body.reuse-current .reuse-confidence-node.is-trust{\n  border-color:var(--hm-blue);\n  background:rgba(0,166,237,.20);\n}'''
new = '''html body.reuse-current .reuse-confidence-node.is-trust{\n  border-color:var(--hm-blue);\n  background:#000;\n}'''
if old not in c:
    raise SystemExit('02.2 blue fill marker missing')
c = c.replace(old, new, 1)

old = 'grid-template-columns:minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr) 22px minmax(0,1fr);'
new = 'grid-template-columns:minmax(0,1fr) 24.2px minmax(0,1fr) 24.2px minmax(0,1fr) 24.2px minmax(0,1fr);'
if old not in c:
    raise SystemExit('tablet 02.2 spacing marker missing')
c = c.replace(old, new, 1)

if 'reuse-confidence-line-pulse' in c:
    raise SystemExit('02.2 motion block already exists')
c += '''\n\n/* 02.2 — focus-driven sequential confidence pulse. */
@keyframes reuse-confidence-line-pulse{
  0%{border-color:var(--hm-line-default)}
  60%{border-color:rgba(255,255,255,1)}
  100%{border-color:var(--hm-line-default)}
}
@keyframes reuse-confidence-trust-pulse{
  0%{background-color:rgba(0,166,237,0)}
  70%{background-color:rgba(0,166,237,.20)}
  100%{background-color:rgba(0,166,237,0)}
}
html body.reuse-current .reuse-confidence-node.is-flow-pulse-standard{
  animation:reuse-confidence-line-pulse 1s linear 1;
}
html body.reuse-current .reuse-confidence-node.is-flow-pulse-trust{
  animation:reuse-confidence-trust-pulse 1s linear 1;
}
@media(prefers-reduced-motion:reduce){
  html body.reuse-current .reuse-confidence-node.is-flow-pulse-standard,
  html body.reuse-current .reuse-confidence-node.is-flow-pulse-trust{
    animation:none!important;
  }
}
'''
p.write_text(c)

js = '''(() => {
  'use strict';

  const flow = document.querySelector('.reuse-confidence-flow');
  if (!flow) return;

  const nodes = Array.from(flow.querySelectorAll('.reuse-confidence-node'));
  if (!nodes.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STEP_DELAY = 700;
  const PULSE_DURATION = 1000;
  const CYCLE_PAUSE = 1500;
  const CYCLE_DURATION = ((nodes.length - 1) * STEP_DELAY) + PULSE_DURATION + CYCLE_PAUSE;
  const STANDARD_CLASS = 'is-flow-pulse-standard';
  const TRUST_CLASS = 'is-flow-pulse-trust';

  let active = false;
  let cycleTimer = 0;
  let nodeTimers = [];

  const clearNodeClasses = () => {
    nodes.forEach((node) => node.classList.remove(STANDARD_CLASS, TRUST_CLASS));
  };

  const stop = () => {
    active = false;
    window.clearTimeout(cycleTimer);
    nodeTimers.forEach((timer) => window.clearTimeout(timer));
    nodeTimers = [];
    clearNodeClasses();
  };

  const pulseNode = (node) => {
    node.classList.remove(STANDARD_CLASS, TRUST_CLASS);
    void node.offsetWidth;
    node.classList.add(node.classList.contains('is-trust') ? TRUST_CLASS : STANDARD_CLASS);
    const cleanup = window.setTimeout(() => {
      node.classList.remove(STANDARD_CLASS, TRUST_CLASS);
    }, PULSE_DURATION);
    nodeTimers.push(cleanup);
  };

  const runCycle = () => {
    if (!active || reducedMotion.matches || document.hidden) return;
    nodeTimers.forEach((timer) => window.clearTimeout(timer));
    nodeTimers = [];
    clearNodeClasses();

    nodes.forEach((node, index) => {
      const timer = window.setTimeout(() => {
        if (active && !document.hidden) pulseNode(node);
      }, index * STEP_DELAY);
      nodeTimers.push(timer);
    });

    cycleTimer = window.setTimeout(runCycle, CYCLE_DURATION);
  };

  const start = () => {
    if (active || reducedMotion.matches || document.hidden) return;
    active = true;
    runCycle();
  };

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry && entry.isIntersecting) start();
    else stop();
  }, {
    root: null,
    rootMargin: '-25% 0px -25% 0px',
    threshold: 0.15
  });

  observer.observe(flow);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  });

  const handleMotionChange = () => {
    if (reducedMotion.matches) stop();
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionChange);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(handleMotionChange);
  }
})();
'''
Path('design-system/reuse-confidence-motion.js').write_text(js)

p = Path('design-system/index.css')
i = p.read_text()
if './components/reuse-confidence.css?v=20260908-10' not in i:
    raise SystemExit('reuse-confidence cache marker missing')
i = i.replace('HIMART Design System v4.2','HIMART Design System v4.3',1)
i = i.replace('./components/reuse-confidence.css?v=20260908-10','./components/reuse-confidence.css?v=20260908-11',1)
p.write_text(i)

p = Path('design-system/himart-system.css')
s = p.read_text()
if './index.css?v=20260908-37' not in s:
    raise SystemExit('system cache marker missing')
s = s.replace('./index.css?v=20260908-37','./index.css?v=20260908-38',1)
s = s.replace('HIMART Shared System v3.1','HIMART Shared System v3.2',1)
p.write_text(s)

p = Path('himart-reuse.html')
h = p.read_text()
if './design-system/himart-system.css?v=20260908-42' not in h:
    raise SystemExit('reuse page cache marker missing')
h = h.replace('./design-system/himart-system.css?v=20260908-42','./design-system/himart-system.css?v=20260908-43',1)
anchor = '<script src="./design-system/animation.js?v=20260906-14"></script>'
motion_script = '<script src="./design-system/reuse-confidence-motion.js?v=20260908-1"></script>'
if motion_script not in h:
    if anchor not in h:
        raise SystemExit('script insertion anchor missing')
    h = h.replace(anchor, motion_script + '\n' + anchor, 1)
p.write_text(h)

checks = {
    'blue fill removed': '.reuse-confidence-node.is-trust{\n  border-color:var(--hm-blue);\n  background:#000;' in c,
    'desktop spacing +10%': '30.8px minmax(0,1fr) 30.8px' in c,
    'tablet spacing +10%': '24.2px minmax(0,1fr) 24.2px' in c,
    'arrow +5%': 'font:100 31.5px/1 var(--hm-font-en);' in c,
    'ordinary pulse 1s': 'reuse-confidence-line-pulse 1s linear 1' in c and '60%{border-color:rgba(255,255,255,1)}' in c,
    'trust pulse 1s': 'reuse-confidence-trust-pulse 1s linear 1' in c and '70%{background-color:rgba(0,166,237,.20)}' in c,
    '70 percent overlap timing': 'const STEP_DELAY = 700;' in js,
    '1.5 sec cycle pause': 'const CYCLE_PAUSE = 1500;' in js,
    'scroll focus observer': "rootMargin: '-25% 0px -25% 0px'" in js,
    'motion script loaded': motion_script in h,
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(('PASS' if ok else 'FAIL') + ' - ' + name)
if failed:
    raise SystemExit('Verification failed: ' + ', '.join(failed))
