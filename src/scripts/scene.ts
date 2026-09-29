/**
 * The live hero scene: one raw-WebGL fragment shader (no library) for the
 * sky, the sliced sun, twinkling stars, the horizon glow and the ocean
 * shimmer, plus the vaporwave grid when the cheat code is on.
 *
 * It paints in the same 1600x900 scene space as the SVG poster underneath
 * (src/design/scene-svg.ts) and uses the same placement rule as the CSS, so
 * the canvas fades in over the poster without a jump. Budget by design: one
 * fullscreen triangle, no textures, no post-processing, a capped backing
 * store, 30 fps, paused offscreen and on hidden tabs, one still frame under
 * reduced motion, adaptive quality that freezes on slow machines, and
 * context loss handled (the poster is always underneath).
 */

import { SLICE_ALPHA, sceneGeometry } from '../design/scene-svg.ts';
import { scene, vaporwave } from '../design/tokens.ts';

const VB_W = 1600;
const VB_H = 900;
const G = sceneGeometry(VB_W, VB_H);

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 R,O;uniform float K,S,T,Gr;
uniform vec3 cT,cM,cL,cH,sT,sB,wF,wN,gC,SU;uniform vec4 SL;uniform float HZ;
float h(vec2 p){vec3 q=fract(p.xyx*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*vn(p);p=p*2.03+17.;a*=.5;}return s;}
vec3 sky(float y){float t=clamp(y/HZ,0.,1.);
if(t<.42)return mix(cT,cM,t/.42);if(t<.8)return mix(cM,cL,(t-.42)/.38);return mix(cL,cH,(t-.8)/.2);}
void main(){
vec2 v=(vec2(gl_FragCoord.x,R.y-gl_FragCoord.y)/K-O)/S;float px=1./(S*K);vec3 c;
float d=length(v-SU.xy),r=SU.z;
if(v.y<HZ){c=sky(v.y);
vec2 g=floor(v/22.),f=fract(v/22.)*22.;float k=h(g);
if(k>.86&&v.y<HZ-150.){vec2 j=vec2(h(g+3.),h(g+7.))*14.+4.;float z=max(abs(f.x-j.x),abs(f.y-j.y));
float b=(1.-smoothstep(.6+k*.8,1.4+k*.9,z))*(.6+.4*sin(T*(1.+3.*k)+k*40.));c=mix(c,vec3(1.,.96,.98),b*(k-.8)*4.);}
c=mix(c,sB,.5*max(0.,1.-d/(2.3*r)));
float s=(v.y-SL.x)/(SL.y-SL.x);float gap=s>0.?step(fract(SL.z*s-fract(T/9.)),SL.w*s):0.;
float disk=1.-smoothstep(r-px,r+px,d);
c=mix(c,mix(mix(sT,sB,clamp((v.y-SU.y+r)/(1.7*r),0.,1.)),cM,gap*${SLICE_ALPHA}),disk);
vec2 e=(v-vec2(SU.x,HZ))/vec2(880.,70.);float el=length(e);
c=mix(c,el<.5?mix(cH,cL,el*2.):cL,el<.5?mix(.9,.35,el*2.):.35*max(0.,2.-el*2.));
}else{float dy=v.y-HZ,t=dy/(${VB_H}.-HZ);c=mix(wF,wN,t);
float z=1./(t+.04);float n=fbm(vec2(v.x*.004*z,z*.9-T*.35));
c+=(n-.5)*.09*cM*(1.-t);
float q=pow(t,.645)*15.;float row=floor(q);float rw=h(vec2(row,5.));
float fq=fract(q+(n-.5)*.35);float bar=1.-smoothstep(.03+.06*t,.07+.1*t,abs(fq-.5));
float w=r*(1.05+1.9*t)*(.72+.4*rw)*.5;float m=max(0.,1.-abs(v.x-SU.x-(rw-.5)*18.-(n-.5)*30.*t)/w);
float sh=.65+.35*sin(T*2.2+row*1.7+n*6.);
c=mix(c,mix(sT,sB,smoothstep(3.5,4.5,q)),bar*m*sh*(.9-.5*t));
c=mix(c,cH,.85*(1.-smoothstep(.8*1.,.8+px*2.,dy)));
if(Gr>0.){float L=14.*pow(t,.4545)-T*.6;float dL=6.36*pow(max(t,.001),-.5455)/(${VB_H}.-HZ)*px;
float X=(v.x-SU.x)/max(dy,.01)*(${VB_H}.-HZ)/150.;float dX=(${VB_H}.-HZ)/(150.*max(dy,.01))*px;
float lh=1.-smoothstep(dL*.8,dL*1.8,.5-abs(fract(L)-.5));
float lv=1.-smoothstep(dX*.8,dX*1.8,.5-abs(fract(X)-.5));
c=mix(c,gC,Gr*.75*max(lh,lv)*smoothstep(0.,90.,dy));}}
c+=(h(gl_FragCoord.xy+fract(T))-.5)/255.;gl_FragColor=vec4(c,1.);}`;

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

const rgb = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16) / 255);

export function start(canvas: HTMLCanvasElement, hero: HTMLElement): void {
  const opts: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'low-power',
    failIfMajorPerformanceCaveat: true,
  };
  const gl = canvas.getContext('webgl', opts);
  if (!gl) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = matchMedia('(pointer: coarse)').matches;
  const root = document.documentElement;
  let q = coarse ? 0.5 : 0.75;
  let prog: WebGLProgram | null = null;
  let loc: Record<string, WebGLUniformLocation | null> = {};
  let t = 0;
  let last = 0;
  let lastDraw = 0;
  let raf = 0;
  let visible = true;
  let lost = false;
  let frozen = false;
  let grid = root.hasAttribute('data-cheat') ? 1 : 0;
  let samples = 0;
  let sum = 0;
  let W = 0;
  let H = 0;
  let k = 1;

  const state = (s: string) => (canvas.dataset.state = s);

  function compile(): Promise<boolean> {
    const p = gl!.createProgram()!;
    for (const [type, src] of [
      [gl!.VERTEX_SHADER, VERT],
      [gl!.FRAGMENT_SHADER, FRAG],
    ] as const) {
      const sh = gl!.createShader(type)!;
      gl!.shaderSource(sh, src);
      gl!.compileShader(sh);
      gl!.attachShader(p, sh);
    }
    gl!.linkProgram(p);
    const ext = gl!.getExtension('KHR_parallel_shader_compile');
    return new Promise((done) => {
      const check = () => {
        if (ext && !gl!.getProgramParameter(p, ext.COMPLETION_STATUS_KHR)) {
          requestAnimationFrame(check);
          return;
        }
        if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) {
          done(false);
          return;
        }
        prog = p;
        gl!.useProgram(p);
        const buf = gl!.createBuffer();
        gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
        gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl!.STATIC_DRAW);
        const a = gl!.getAttribLocation(p, 'p');
        gl!.enableVertexAttribArray(a);
        gl!.vertexAttribPointer(a, 2, gl!.FLOAT, false, 0, 0);
        loc = {};
        for (const name of ['R', 'O', 'K', 'S', 'T', 'Gr', 'SU', 'SL', 'HZ', 'cT', 'cM', 'cL', 'cH', 'sT', 'sB', 'wF', 'wN', 'gC']) {
          loc[name] = gl!.getUniformLocation(p, name);
        }
        const colors: [string, string][] = [
          ['cT', scene.skyTop],
          ['cM', scene.skyMid],
          ['cL', scene.skyLow],
          ['cH', scene.horizon],
          ['sT', scene.sunTop],
          ['sB', scene.sunBottom],
          ['wF', scene.waterFar],
          ['wN', scene.waterNear],
          ['gC', vaporwave.grid],
        ];
        for (const [name, hex] of colors) gl!.uniform3fv(loc[name]!, rgb(hex));
        gl!.uniform3f(loc.SU!, G.sun.cx, G.sun.cy, G.sun.r);
        gl!.uniform4f(loc.SL!, G.slices.top, G.slices.bottom, G.slices.bands, G.slices.gap);
        gl!.uniform1f(loc.HZ!, G.horizon);
        W = 0;
        done(true);
      };
      check();
    });
  }

  /** Same placement as the CSS poster: cover, bottom-aligned, sun at --sun-at of the width, clamped to cover. */
  function layout(): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5) * q;
    let kk = scale;
    if (w * h * kk * kk > 1.5e6) kk = Math.sqrt(1.5e6 / (w * h));
    if (w === W && h === H && kk === k) return;
    W = w;
    H = h;
    k = kk;
    canvas.width = Math.max(1, Math.round(w * k));
    canvas.height = Math.max(1, Math.round(h * k));
    gl!.viewport(0, 0, canvas.width, canvas.height);
    const sunAt = Number.parseFloat(getComputedStyle(canvas).getPropertyValue('--sun-at')) || 0.66;
    const sw = Math.max(w, (h * VB_W) / VB_H);
    const s = sw / VB_W;
    const offX = Math.min(0, Math.max(w - sw, sunAt * w - (G.sun.cx / VB_W) * sw));
    const offY = h - VB_H * s;
    gl!.uniform2f(loc.R!, canvas.width, canvas.height);
    gl!.uniform1f(loc.K!, canvas.width / w);
    gl!.uniform1f(loc.S!, s);
    gl!.uniform2f(loc.O!, offX, offY);
  }

  function draw(): void {
    if (!prog || lost) return;
    layout();
    gl!.uniform1f(loc.T!, t);
    gl!.uniform1f(loc.Gr!, grid);
    gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    if (!canvas.classList.contains('on')) requestAnimationFrame(() => canvas.classList.add('on'));
  }

  function frame(now: number): void {
    raf = requestAnimationFrame(frame);
    const dt = last ? Math.min(now - last, 100) : 16;
    last = now;
    // Adaptive quality: after a warm-up, average 60 frame intervals.
    if (++samples > 30) {
      sum += dt;
      if (samples === 90) {
        if (sum / 60 > 20) {
          q *= 0.75;
          if (q < 0.4) {
            frozen = true;
            state('frozen');
            stop();
            return;
          }
          canvas.dataset.q = q.toFixed(2);
        }
        samples = 0;
        sum = 0;
      }
    }
    t += dt / 1000;
    const target = root.hasAttribute('data-cheat') ? 1 : 0;
    grid += (target - grid) * Math.min(1, dt / 250);
    if (Math.abs(target - grid) < 0.01) grid = target;
    if (now - lastDraw < 1000 / 30 - 3) return;
    lastDraw = now;
    draw();
  }

  function stop(): void {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
  }

  function sync(): void {
    const run = visible && !document.hidden && !reduce.matches && !frozen && !lost && prog !== null;
    if (run && !raf) {
      samples = 0;
      sum = 0;
      state('live');
      raf = requestAnimationFrame(frame);
    } else if (!run && raf) {
      stop();
      state('paused');
    }
    if (reduce.matches && !frozen) {
      state('still');
      grid = root.hasAttribute('data-cheat') ? 1 : 0;
      draw();
    }
  }

  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    lost = true;
    prog = null;
    canvas.classList.remove('on');
    state('lost');
    stop();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    lost = false;
    compile().then((ok) => ok && (draw(), sync()));
  });

  new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    sync();
  }).observe(hero);
  document.addEventListener('visibilitychange', sync);
  reduce.addEventListener('change', sync);
  addEventListener('rg:cheat', () => {
    if (!raf) {
      grid = root.hasAttribute('data-cheat') ? 1 : 0;
      draw();
    }
  });
  new ResizeObserver(() => !raf && draw()).observe(canvas);

  compile().then((ok) => {
    if (!ok) return;
    draw();
    sync();
  });
}
