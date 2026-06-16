/* ============================================================
   WebGL background — flowing noise gradient (Three.js)
   A full-screen shader plane with domain-warped simplex noise,
   reacting to mouse position and scroll velocity.
   Gracefully no-ops if WebGL / Three is unavailable.
   ============================================================ */
(function () {
  const canvas = document.getElementById("gl");
  if (!canvas || typeof THREE === "undefined") return;

  // Respect reduced motion + tiny / low-power devices: keep a calm static field
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "low-power" });
  } catch (e) {
    return; // no WebGL — CSS background remains
  }

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    u_time: { value: 0 },
    u_res: { value: new THREE.Vector2() },
    u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
    u_scroll: { value: 0 },
    u_intensity: { value: reduceMotion ? 0.25 : 1.0 },
    u_colorA: { value: new THREE.Color("#0a0a0b") },
    u_colorB: { value: new THREE.Color("#1a1320") },
    u_accent: { value: new THREE.Color("#e8553f") },
    u_accent2: { value: new THREE.Color("#6b5cff") },
  };

  const vert = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `;

  const frag = `
    precision highp float;
    varying vec2 vUv;
    uniform float u_time;
    uniform vec2  u_res;
    uniform vec2  u_mouse;
    uniform float u_scroll;
    uniform float u_intensity;
    uniform vec3  u_colorA;
    uniform vec3  u_colorB;
    uniform vec3  u_accent;
    uniform vec3  u_accent2;

    // simplex noise (Ashima)
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
      i=mod289(i);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m; m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;
      vec3 h=abs(x)-0.5;
      vec3 ox=floor(x+0.5);
      vec3 a0=x-ox;
      m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g;
      g.x=a0.x*x0.x+h.x*x0.y;
      g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }

    // fractal brownian motion
    float fbm(vec2 p){
      float v=0.0; float a=0.5;
      for(int i=0;i<5;i++){ v+=a*snoise(p); p*=2.0; a*=0.5; }
      return v;
    }

    void main(){
      vec2 uv = vUv;
      float aspect = u_res.x / u_res.y;
      vec2 p = uv;
      p.x *= aspect;

      float t = u_time * 0.06 * u_intensity;

      // domain warp
      vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
      vec2 r = vec2(fbm(p + 1.7*q + vec2(8.3, 2.8) + 0.15*t),
                    fbm(p + 1.7*q + vec2(2.1, 9.2) - 0.12*t));
      float f = fbm(p + 1.5 * r);

      // mouse influence — soft light following pointer
      vec2 m = u_mouse; m.x *= aspect;
      float d = distance(p, m);
      float glow = smoothstep(0.65, 0.0, d) * 0.6;

      // base gradient
      vec3 col = mix(u_colorA, u_colorB, smoothstep(0.0, 1.0, uv.y + f*0.25));

      // accent bands from warped noise
      float band = smoothstep(0.35, 0.75, f + 0.2);
      col = mix(col, u_accent2 * 0.5, band * 0.45);
      float band2 = smoothstep(0.45, 0.9, r.x + q.y);
      col = mix(col, u_accent * 0.7, band2 * (0.3 + 0.3*u_intensity));

      // pointer glow tint
      col += u_accent * glow * 0.18;
      col += u_accent2 * glow * 0.10;

      // scroll-driven hue lift
      col += vec3(0.02, 0.01, 0.03) * u_scroll;

      // subtle vignette
      float vig = smoothstep(1.2, 0.2, distance(uv, vec2(0.5)));
      col *= 0.55 + 0.45 * vig;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: vert, fragmentShader: frag });
  const geo = new THREE.PlaneGeometry(2, 2);
  scene.add(new THREE.Mesh(geo, material));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    uniforms.u_res.value.set(w * dpr, h * dpr);
  }
  resize();
  window.addEventListener("resize", resize);

  // smooth mouse
  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener("pointermove", (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1.0 - e.clientY / window.innerHeight;
  });

  // expose scroll hook for main.js
  window.__glSetScroll = (v) => { uniforms.u_scroll.value = v; };

  const clock = new THREE.Clock();
  let visible = true;
  document.addEventListener("visibilitychange", () => { visible = !document.hidden; });

  function tick() {
    requestAnimationFrame(tick);
    if (!visible) return;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    uniforms.u_mouse.value.set(mouse.x, mouse.y);
    uniforms.u_time.value = clock.getElapsedTime();
    renderer.render(scene, camera);
  }
  tick();
})();
