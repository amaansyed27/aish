const canvas = document.getElementById('field');
const gl = canvas.getContext('webgl', { antialias: false, alpha: true });

function sizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * ratio);
  canvas.height = Math.floor(innerHeight * ratio);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
}
sizeCanvas();
addEventListener('resize', sizeCanvas);

if (gl) {
  const vertex = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}');
  gl.compileShader(vertex);

  const fragment = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment, `precision mediump float;uniform vec2 r;uniform float t;void main(){vec2 uv=gl_FragCoord.xy/r.xy;float d=distance(uv,vec2(.18+.04*sin(t*.2),.2+.05*cos(t*.15)));float halo=.42/(d+0.12);float grid=(sin((uv.x+uv.y+t*.015)*80.)*.5+.5)*.035;vec3 base=vec3(.035,.03,.026);vec3 warm=vec3(.64,.52,.35)*halo*.24;gl_FragColor=vec4(base+warm+grid,1.);}`);
  gl.compileShader(fragment);

  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const res = gl.getUniformLocation(program, 'r');
  const time = gl.getUniformLocation(program, 't');

  function frame(now) {
    gl.uniform2f(res, canvas.width, canvas.height);
    gl.uniform1f(time, now / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  }
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

let current = window.scrollY;
let target = current;
let ticking = false;

window.addEventListener('wheel', (event) => {
  if (Math.abs(event.deltaY) < 1) return;
  target = Math.max(0, Math.min(document.body.scrollHeight - innerHeight, target + event.deltaY));
  if (!ticking) requestAnimationFrame(smooth);
  ticking = true;
}, { passive: true });

function smooth() {
  current += (target - current) * 0.08;
  if (Math.abs(target - current) > 0.5) {
    scrollTo(0, current);
    requestAnimationFrame(smooth);
  } else {
    scrollTo(0, target);
    current = target;
    ticking = false;
  }
}
