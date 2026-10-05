import { memo, useEffect, useRef } from "react";
import "./AnimatedBackground.css";
const TAU = Math.PI * 2;
const CONFIG = {
  desktop: { particles: 160, nodes: 40, pulses: 10, streams: 6, fps: 60 },
  tablet: { particles: 90, nodes: 25, pulses: 6, streams: 4, fps: 60 },
  mobile: { particles: 40, nodes: 12, pulses: 3, streams: 2, fps: 30 },
};

const random = (seed = 12345) => {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
};

function createEngine(root, canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return { destroy() {} };

  const cursor = root.querySelector(".ib-cursor");

  let width = 0;
  let height = 0;
  let dpr = 1;
  let raf = 0;
  let last = 0;
  let time = 0;
  let destroyed = false;

  let tier = "desktop";
  let config = CONFIG.desktop;

  let particles = [];
  let nodes = [];
  let pulses = [];
  let streams = [];

  const mouse = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
  };

  const rnd = random();

  function setup() {
    particles = Array.from(
      { length: config.particles },
      () => ({
        x: rnd() * 1.4 - 0.2,
        y: rnd() * 1.4 - 0.2,
        z: rnd(),
        speed: 0.002 + rnd() * 0.004,
        size: 0.5 + rnd() * 1.5,
        phase: rnd() * TAU,
      })
    );

    nodes = Array.from(
      { length: config.nodes },
      () => ({
        x: rnd(),
        y: rnd(),
        z: rnd(),
        phase: rnd() * TAU,
      })
    );

    pulses = Array.from(
      { length: config.pulses },
      () => ({
        a: 0,
        b: 1,
        progress: rnd(),
        speed: 0.15 + rnd() * 0.25,
        active: false,
      })
    );

    streams = Array.from(
      { length: config.streams },
      (_, i) => ({
        x: i % 2 ? 0.9 : 0.1,
        progress: rnd(),
        speed: 0.1 + rnd() * 0.15,
      })
    );
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    tier =
      width < 640
        ? "mobile"
        : width < 1024
        ? "tablet"
        : "desktop";

    config = CONFIG[tier];

    dpr = Math.min(
      window.devicePixelRatio || 1,
      tier === "desktop" ? 1.75 : 1.5
    );

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    setup();
  }

  function project(p) {
    const depth = 0.75 + p.z * 0.45;

    return {
      x: width * (p.x - 0.5) * depth + width / 2,
      y: height * (p.y - 0.5) * depth + height / 2,
      depth,
    };
  }

  function drawParticles(dt) {
    particles.forEach((p) => {
      p.y -= p.speed * dt;

      if (p.y < -0.2) p.y = 1.2;

      const point = project(p);

      let x = point.x;
      let y = point.y;

      if (mouse.active && tier !== "mobile") {
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150 && distance > 1) {
          const force = (1 - distance / 150) * 12;

          x += (dx / distance) * force;
          y += (dy / distance) * force;
        }
      }

      const alpha =
        0.25 +
        point.depth * 0.55 +
        Math.sin(time * 0.002 + p.phase) * 0.15;

      ctx.globalAlpha = Math.max(0.05, alpha);
      ctx.fillStyle = "#8edcff";

      ctx.beginPath();
      ctx.arc(
        x,
        y,
        p.size * point.depth,
        0,
        TAU
      );

      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  function drawNetwork() {
    const points = nodes.map((node) => {
      const p = project({
        x:
          node.x +
          Math.sin(time * 0.0005 + node.phase) * 0.015,
        y:
          node.y +
          Math.cos(time * 0.0004 + node.phase) * 0.015,
        z: node.z,
      });

      return p;
    });

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];

        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 170) continue;

        const alpha = (1 - distance / 170) * 0.35;

        ctx.strokeStyle = `rgba(70,175,245,${alpha})`;
        ctx.lineWidth = 0.8;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    points.forEach((p, i) => {
      const pulse =
        1 +
        Math.sin(time * 0.002 + nodes[i].phase) * 0.3;

      ctx.fillStyle = "#e1f4ff";
      ctx.globalAlpha = 0.7;

      ctx.beginPath();
      ctx.arc(
        p.x,
        p.y,
        1.5 * pulse,
        0,
        TAU
      );

      ctx.fill();
    });

    ctx.globalAlpha = 1;
  }

  function drawStreams(dt) {
    streams.forEach((stream) => {
      stream.progress += stream.speed * dt;

      if (stream.progress > 1) {
        stream.progress = 0;
      }

      const x = stream.x * width;
      const y = stream.progress * height;

      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#0b9af0";

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, TAU);
      ctx.fill();

      ctx.globalAlpha = 1;
    });
  }

  function drawPulses(dt) {
    pulses.forEach((pulse) => {
      if (!pulse.active) {
        if (Math.random() > 0.995) {
          pulse.a = Math.floor(rnd() * nodes.length);
          pulse.b = Math.floor(rnd() * nodes.length);

          if (pulse.a !== pulse.b) {
            pulse.progress = 0;
            pulse.active = true;
          }
        }

        return;
      }

      pulse.progress += pulse.speed * dt;

      if (pulse.progress >= 1) {
        pulse.active = false;
        return;
      }

      const a = project(nodes[pulse.a]);
      const b = project(nodes[pulse.b]);

      const x = a.x + (b.x - a.x) * pulse.progress;
      const y = a.y + (b.y - a.y) * pulse.progress;

      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 12;
      ctx.shadowColor = "#0b9af0";

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, TAU);
      ctx.fill();

      ctx.shadowBlur = 0;
    });
  }

  function animate(now) {
    if (destroyed) return;

    const dt = Math.min(
      (now - last) / 1000,
      0.05
    );

    last = now;
    time += dt * 1000;

    ctx.clearRect(0, 0, width, height);

    mouse.x += (mouse.targetX - mouse.x) * 0.08;
    mouse.y += (mouse.targetY - mouse.y) * 0.08;

    drawParticles(dt);
    drawNetwork();
    drawStreams(dt);
    drawPulses(dt);

    if (cursor && tier !== "mobile") {
      cursor.style.transform =
        `translate3d(${mouse.x - 225}px, ${mouse.y - 225}px, 0)`;

      cursor.style.opacity = mouse.active ? "1" : "0";
    }

    raf = requestAnimationFrame(animate);
  }

  function onMouseMove(e) {
    if (tier === "mobile") return;

    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  }

  function onMouseLeave() {
    mouse.active = false;
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(raf);
    } else {
      last = performance.now();
      raf = requestAnimationFrame(animate);
    }
  }

  resize();

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onMouseMove);
  window.addEventListener("blur", onMouseLeave);
  document.addEventListener(
    "mouseleave",
    onMouseLeave
  );
  document.addEventListener(
    "visibilitychange",
    onVisibility
  );

  raf = requestAnimationFrame(animate);

  return {
    destroy() {
      destroyed = true;

      cancelAnimationFrame(raf);

      window.removeEventListener("resize", resize);
      window.removeEventListener(
        "pointermove",
        onMouseMove
      );
      window.removeEventListener(
        "blur",
        onMouseLeave
      );

      document.removeEventListener(
        "mouseleave",
        onMouseLeave
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );
    },
  };
}

const Aurora = memo(() => (
  <div className="ib-aurora">
    <div className="ib-blob ib-blob--a" />
    <div className="ib-blob ib-blob--b" />
    <div className="ib-blob ib-blob--c" />
  </div>
));

const TechGrid = memo(() => (
  <div className="ib-grid">
    <div className="ib-grid__plane">
      <div className="ib-grid__lines" />
    </div>
  </div>
));

const Circuit = memo(({ side }) => (
  <div className={`ib-circuit ib-circuit--${side}`}>
    <svg
      viewBox="0 0 260 900"
      preserveAspectRatio="xMinYMin slice"
    >
      <path
        d="M0 150 H64 L104 190 H176 L206 220 V330"
        className="ib-trace"
      />

      <path
        d="M0 330 H36 L84 378 V516 L124 556 H214"
        className="ib-trace"
      />

      <path
        d="M0 600 H28 L58 630 V712 L98 752 H170"
        className="ib-trace"
      />

      <circle cx="206" cy="220" r="4" />
      <circle cx="84" cy="378" r="4" />
      <circle cx="170" cy="752" r="4" />
    </svg>
  </div>
));

function AnimatedBackground() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const engine = createEngine(
      rootRef.current,
      canvasRef.current
    );

    return () => engine.destroy();
  }, []);

  return (
    <div
      className="ib-root"
      ref={rootRef}
      aria-hidden="true"
    >
      <div className="ib-base" />

      <div className="ib-layer">
        <Aurora />
      </div>

      <div className="ib-layer">
        <TechGrid />
      </div>

      <canvas
        className="ib-canvas"
        ref={canvasRef}
      />

      <div className="ib-layer">
        <Circuit side="left" />
        <Circuit side="right" />
      </div>

      <div className="ib-scan" />
      <div className="ib-light ib-light--top" />
      <div className="ib-light ib-light--tr" />
      <div className="ib-light ib-light--bl" />
      <div className="ib-cursor" />
      <div className="ib-vignette" />
      <div className="ib-noise" />
    </div>
  );
}

export default memo(AnimatedBackground);