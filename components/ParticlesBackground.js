import { useEffect, useRef } from 'react';

export default function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });

    // CONFIG
    const config = {
      count: 200,
      baseSize: 1.6,
      sizeVariance: 2.4,
      speed: 0.02, // movement speed multiplier
      focalLength: 300, // perspective focal length
      spread: 120, // spread on x/y
      depth: 600, // range of z positions
      hueSpeed: 0.02, // color cycle speed
      glowBase: 18,
      connectDistance: 110,
      useColorCycle: true, // true => cycling colors; false => white particles
      whiteAlpha: 0.9,
    };

    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let cx = 0;
    let cy = 0;

    const setSize = () => {
      dpr = window.devicePixelRatio || 1;
      width = Math.max(300, window.innerWidth);
      height = Math.max(300, window.innerHeight);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      cx = width / 2;
      cy = height / 2;
      // scale drawing ops to account for DPR (we draw in CSS pixels)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setSize();

    // Particle model
    class P {
      constructor() {
        // initial x,y within a spread box around center
        this.x = (Math.random() - 0.5) * config.spread * 2 + cx;
        this.y = (Math.random() - 0.5) * config.spread * 2 + cy;
        // z from -depth/2 to +depth/2 (negative = closer)
        this.z = (Math.random() - 0.5) * config.depth;
        // velocity small
        this.vx = (Math.random() - 0.5) * config.speed * 40;
        this.vy = (Math.random() - 0.5) * config.speed * 40;
        this.vz = (Math.random() - 0.5) * config.speed * 40 * 0.2;
        this.seed = Math.random() * 1000;
        this.baseSize = config.baseSize + Math.random() * config.sizeVariance;
      }

      update(dt, mouse) {
        // gentle movement
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.z += this.vz * dt;

        // small perlin-ish wobble via seed/time
        const t = performance.now() * 0.0005;
        this.x += Math.sin(this.seed + t) * 0.04;
        this.y += Math.cos(this.seed + t * 0.7) * 0.04;

        // wrap-around depth & bounds for continuous effect
        if (this.x < -config.spread) this.x = width + config.spread;
        if (this.x > width + config.spread) this.x = -config.spread;
        if (this.y < -config.spread) this.y = height + config.spread;
        if (this.y > height + config.spread) this.y = -config.spread;
        if (this.z < -config.depth / 2) this.z = config.depth / 2;
        if (this.z > config.depth / 2) this.z = -config.depth / 2;

        // mouse influence: slight attraction/repel feeling with parallax
        if (mouse) {
          const dx = (mouse.x - cx) * 0.0015;
          const dy = (mouse.y - cy) * 0.0015;
          // nearer particles react more
          const depthFactor = (config.focalLength / (config.focalLength + this.z)) ; // ~0..2
          this.x += dx * 60 * depthFactor;
          this.y += dy * 60 * depthFactor;
        }
      }

      draw(hue) {
        // perspective scale
        const scale = config.focalLength / (config.focalLength + this.z);
        const sx = (this.x - cx) * scale + cx;
        const sy = (this.y - cy) * scale + cy;
        const size = Math.max(0.5, this.baseSize * scale * 1.6);

        // choose color
        let color;
        if (config.useColorCycle) {
          const h = (hue + (this.seed % 50)) % 360;
          color = `hsla(${h}, 85%, 70%, 0.95)`;
        } else {
          color = `rgba(255,255,255,${config.whiteAlpha})`;
        }

        // glow intensity based on closeness
        const glow = config.glowBase * (1 + (1 - scale));

        // set composite & shadow for luminous effect
        ctx.globalCompositeOperation = 'lighter';
        ctx.shadowBlur = glow;
        ctx.shadowColor = color;

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // optional subtle ring for nearer particles
        if (scale > 0.9) {
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.06;
          ctx.lineWidth = Math.min(2, size * 0.8);
          ctx.beginPath();
          ctx.arc(sx, sy, size + 1.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.globalCompositeOperation = 'source-over';
      }
    }

    // create particles
    const particles = [];
    for (let i = 0; i < config.count; i++) particles.push(new P());

    // mouse tracking
    const mouse = { x: cx, y: cy, active: false };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // resize
    const onResize = () => {
      setSize();
    };
    window.addEventListener('resize', onResize);

    // connect close particles with subtle lines (depth aware)
    function connect(pList) {
      const len = pList.length;
      for (let a = 0; a < len; a++) {
        const A = pList[a];
        for (let b = a + 1; b < len; b++) {
          const B = pList[b];
          // quick bbox reject using screen space approx
          const az = config.focalLength / (config.focalLength + A.z);
          const bz = config.focalLength / (config.focalLength + B.z);
          const ax = (A.x - cx) * az + cx;
          const ay = (A.y - cy) * az + cy;
          const bx = (B.x - cx) * bz + cx;
          const by = (B.y - cy) * bz + cy;

          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < config.connectDistance) {
            const alpha = 0.18 * (1 - dist / config.connectDistance);
            // line color derived from average seed/hue
            const hue = (performance.now() * config.hueSpeed * 0.06) % 360;
            ctx.strokeStyle = `hsla(${hue}, 85%, 70%, ${alpha})`;
            ctx.lineWidth = 0.9 * Math.min(1, (az + bz) / 2);
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
      }
    }

    let rafId = null;
    let last = performance.now();

    function frame(now) {
      const dt = Math.min(60, now - last) / 16.666; // ~1 at 60fps
      last = now;

      // background fill (dark)
      ctx.fillStyle = '#050814'; // deep navy
      ctx.fillRect(0, 0, width, height);

      // hue cycling base
      const hueBase = (now * config.hueSpeed * 0.03) % 360;

      // update + draw
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(dt, mouse.active ? mouse : null);
      }

      // draw connections first (so particles are visually on top)
      ctx.save();
      ctx.lineCap = 'round';
      connect(particles);
      ctx.restore();

      for (let i = 0; i < particles.length; i++) {
        particles[i].draw(hueBase);
      }

      // subtle vignette overlay for depth
      ctx.globalCompositeOperation = 'overlay';
      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.06)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'source-over';

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);

    // cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}