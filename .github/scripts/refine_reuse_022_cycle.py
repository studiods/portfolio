from pathlib import Path
import re

css_path = Path('design-system/components/reuse-confidence.css')
css = css_path.read_text()
marker = '/* 02.2 — focus-driven sequential confidence pulse. */'
if marker not in css:
    raise SystemExit('02.2 motion marker missing')
head = css.split(marker, 1)[0].rstrip()
motion = r'''/* 02.2 — focus-driven sequential confidence pulse. */
@keyframes reuse-confidence-line-pulse{
  0%{border-color:var(--hm-line-default)}
  50%{border-color:rgba(255,255,255,.60)}
  100%{border-color:var(--hm-line-default)}
}
@keyframes reuse-confidence-trust-pulse{
  0%{background-color:rgba(0,166,237,0)}
  50%{background-color:rgba(0,166,237,.20)}
  100%{background-color:rgba(0,166,237,.20)}
}
html body.reuse-current .reuse-confidence-node.is-flow-pulse-standard{
  animation:reuse-confidence-line-pulse 2s ease-in-out 1;
}
html body.reuse-current .reuse-confidence-node.is-flow-pulse-trust{
  animation:reuse-confidence-trust-pulse 2s ease-in-out 1 forwards;
}
html body.reuse-current .reuse-confidence-node.is-flow-trust-held{
  background-color:rgba(0,166,237,.20)!important;
}
html body.reuse-current .reuse-confidence-node.is-flow-trust-resetting{
  background-color:rgba(0,166,237,0)!important;
  transition:background-color 2s ease-in-out!important;
}
@media(prefers-reduced-motion:reduce){
  html body.reuse-current .reuse-confidence-node.is-flow-pulse-standard,
  html body.reuse-current .reuse-confidence-node.is-flow-pulse-trust{
    animation:none!important;
  }
  html body.reuse-current .reuse-confidence-node.is-flow-trust-resetting{
    transition:none!important;
  }
}
'''
css_path.write_text(head + '\n\n' + motion)

js = r'''(() => {
  'use strict';

  const flow = document.querySelector('.reuse-confidence-flow');
  if (!flow) return;

  const nodes = Array.from(flow.querySelectorAll('.reuse-confidence-node'));
  const trustNodes = nodes.filter((node) => node.classList.contains('is-trust'));
  if (!nodes.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const STEP_DELAY = 600;
  const PULSE_DURATION = 2000;
  const FINAL_HOLD = 2000;
  const RESET_DURATION = 2000;
  const RESTART_DELAY = 2000;
  const STANDARD_CLASS = 'is-flow-pulse-standard';
  const TRUST_CLASS = 'is-flow-pulse-trust';
  const HELD_CLASS = 'is-flow-trust-held';
  const RESET_CLASS = 'is-flow-trust-resetting';

  let active = false;
  let inFocus = false;
  let timers = [];
  let resetFrame = 0;

  const schedule = (callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  };

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
    if (resetFrame) {
      window.cancelAnimationFrame(resetFrame);
      resetFrame = 0;
    }
  };

  const clearNodeClasses = () => {
    nodes.forEach((node) => node.classList.remove(
      STANDARD_CLASS,
      TRUST_CLASS,
      HELD_CLASS,
      RESET_CLASS
    ));
  };

  const stop = () => {
    active = false;
    clearTimers();
    clearNodeClasses();
  };

  const pulseNode = (node) => {
    node.classList.remove(STANDARD_CLASS, TRUST_CLASS, HELD_CLASS, RESET_CLASS);
    void node.offsetWidth;

    if (node.classList.contains('is-trust')) {
      node.classList.add(TRUST_CLASS);
      schedule(() => {
        if (!active) return;
        node.classList.remove(TRUST_CLASS);
        node.classList.add(HELD_CLASS);
      }, PULSE_DURATION);
      return;
    }

    node.classList.add(STANDARD_CLASS);
    schedule(() => {
      node.classList.remove(STANDARD_CLASS);
    }, PULSE_DURATION);
  };

  const beginGlobalReset = () => {
    if (!active || document.hidden || reducedMotion.matches) return;

    trustNodes.forEach((node) => {
      node.classList.remove(TRUST_CLASS, RESET_CLASS);
      node.classList.add(HELD_CLASS);
    });

    resetFrame = window.requestAnimationFrame(() => {
      resetFrame = window.requestAnimationFrame(() => {
        if (!active) return;
        trustNodes.forEach((node) => {
          node.classList.add(RESET_CLASS);
          node.classList.remove(HELD_CLASS);
        });
        resetFrame = 0;
      });
    });

    schedule(() => {
      if (!active) return;
      trustNodes.forEach((node) => node.classList.remove(RESET_CLASS, HELD_CLASS, TRUST_CLASS));
      schedule(() => {
        if (active && inFocus && !document.hidden && !reducedMotion.matches) runCycle();
      }, RESTART_DELAY);
    }, RESET_DURATION);
  };

  const runCycle = () => {
    if (!active || !inFocus || reducedMotion.matches || document.hidden) return;

    clearTimers();
    clearNodeClasses();

    nodes.forEach((node, index) => {
      schedule(() => {
        if (active && inFocus && !document.hidden) pulseNode(node);
      }, index * STEP_DELAY);
    });

    const sequenceEnd = ((nodes.length - 1) * STEP_DELAY) + PULSE_DURATION;
    schedule(beginGlobalReset, sequenceEnd + FINAL_HOLD);
  };

  const start = () => {
    if (active || reducedMotion.matches || document.hidden || !inFocus) return;
    active = true;
    runCycle();
  };

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    inFocus = Boolean(entry && entry.isIntersecting);
    if (inFocus) start();
    else stop();
  }, {
    root: null,
    rootMargin: '-25% 0px -25% 0px',
    threshold: 0.15
  });

  observer.observe(flow);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (inFocus) start();
  });

  const handleMotionChange = () => {
    if (reducedMotion.matches) stop();
    else if (inFocus) start();
  };
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', handleMotionChange);
  } else if (typeof reducedMotion.addListener === 'function') {
    reducedMotion.addListener(handleMotionChange);
  }
})();
'''
Path('design-system/reuse-confidence-motion.js').write_text(js)

index_path = Path('design-system/index.css')
index = index_path.read_text()
index, n = re.subn(r'(reuse-confidence\.css\?v=20260908-)(\d+)', lambda m: m.group(1) + str(int(m.group(2)) + 1), index, count=1)
if n != 1:
    raise SystemExit('component cache marker missing')
index = re.sub(r'HIMART Design System v(\d+)\.(\d+)', lambda m: f'HIMART Design System v{m.group(1)}.{int(m.group(2)) + 1}', index, count=1)
index_path.write_text(index)

system_path = Path('design-system/himart-system.css')
system = system_path.read_text()
system, n = re.subn(r'(index\.css\?v=20260908-)(\d+)', lambda m: m.group(1) + str(int(m.group(2)) + 1), system, count=1)
if n != 1:
    raise SystemExit('system cache marker missing')
system = re.sub(r'HIMART Shared System v(\d+)\.(\d+)', lambda m: f'HIMART Shared System v{m.group(1)}.{int(m.group(2)) + 1}', system, count=1)
system_path.write_text(system)

html_path = Path('himart-reuse.html')
html = html_path.read_text()
html, n = re.subn(r'(himart-system\.css\?v=20260908-)(\d+)', lambda m: m.group(1) + str(int(m.group(2)) + 1), html, count=1)
if n != 1:
    raise SystemExit('page system cache marker missing')
motion_pattern = r'(reuse-confidence-motion\.js\?v=20260908-)(\d+)'
if re.search(motion_pattern, html):
    html = re.sub(motion_pattern, lambda m: m.group(1) + str(int(m.group(2)) + 1), html, count=1)
else:
    anchor = '<script src="./design-system/animation.js'
    pos = html.find(anchor)
    if pos < 0:
        raise SystemExit('motion script insertion anchor missing')
    html = html[:pos] + '<script src="./design-system/reuse-confidence-motion.js?v=20260908-1"></script>\n' + html[pos:]
html_path.write_text(html)

css = css_path.read_text()
js = Path('design-system/reuse-confidence-motion.js').read_text()
html = html_path.read_text()
checks = {
    'blue pulse holds at 20%': '100%{background-color:rgba(0,166,237,.20)}' in css and 'forwards' in css,
    'held blue state exists': 'is-flow-trust-held' in css,
    'slow global reset 2s': 'is-flow-trust-resetting' in css and 'transition:background-color 2s ease-in-out' in css,
    'last fill hold 2s': 'const FINAL_HOLD = 2000;' in js,
    'reset duration 2s': 'const RESET_DURATION = 2000;' in js,
    'restart wait 2s': 'const RESTART_DELAY = 2000;' in js,
    'old fixed cycle removed': 'CYCLE_PAUSE' not in js and 'CYCLE_DURATION' not in js,
    'global reset after sequence': 'schedule(beginGlobalReset, sequenceEnd + FINAL_HOLD);' in js,
    'scroll reset preserved': 'else stop();' in js and 'clearNodeClasses();' in js,
    'motion script loaded': 'reuse-confidence-motion.js?v=20260908-' in html,
}
failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(('PASS' if ok else 'FAIL') + ' - ' + name)
if failed:
    raise SystemExit('Verification failed: ' + ', '.join(failed))
