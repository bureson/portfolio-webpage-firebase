import React from 'react';

// Aurora background ported from ".mockup/Aurora Background Prototype.dc.html":
// noise-driven vertical rays drift on the blurred layer (.aurora-canvas, CSS blur
// turns them into northern-lights curtains) while stars twinkle and Perseid
// meteors streak on the sharp layer (.star-canvas).

const PALETTES = {
    nordic: (s, a) => `hsla(${120 + s * 80}, 80%, 55%, ${a})`,
    gold: (s, a) => s < 0.55 ? `hsla(${40 + s * 15}, 75%, 58%, ${a})` : `hsla(${230 + s * 25}, 65%, 60%, ${a})`,
    violet: (s, a) => `hsla(${260 + s * 60}, 75%, 62%, ${a})`,
};

const RAY_SPACING = 16; // one ray per 16 CSS px of width (~220 rays at 3440px)
const MIN_RAYS = 30;
const STAR_COUNT = 140;
const CONTRAST = 1; // scales ray alpha; the matching blur/brightness lives in index.css

const Aurora = (props) => {
    const auroraRef = React.useRef(null);
    const starRef = React.useRef(null);
    const palette = PALETTES[props.palette] || PALETTES.nordic;

    React.useEffect(() => {

        const canvas = auroraRef.current;
        const starCanvas = starRef.current;
        const ctx = canvas.getContext('2d');
        const stx = starCanvas.getContext('2d');
        if (!ctx || !stx) return; // canvas unsupported (e.g. jsdom in tests)

        let w, h, dpr, raf;
        const rand = (a, b) => a + Math.random() * (b - a);

        // value noise
        const P = new Uint8Array(512);
        const perm = [...Array(256).keys()].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
        const fade = (t) => t * t * (3 - 2 * t);
        const n2 = (x, y) => {
            const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
            const fx = x - Math.floor(x), fy = y - Math.floor(y);
            const h00 = P[P[X] + Y] / 255, h10 = P[P[X + 1] + Y] / 255;
            const h01 = P[P[X] + Y + 1] / 255, h11 = P[P[X + 1] + Y + 1] / 255;
            const u = fade(fx), v = fade(fy);
            return (h00 * (1 - u) + h10 * u) * (1 - v) + (h01 * (1 - u) + h11 * u) * v;
        };

        const rays = [];
        const stars = [];
        const initRay = (r, first) => {
            r.x = Math.random();
            r.seed = rand(0, 100);
            r.width = rand(6, 26);
            r.hueSeed = Math.random();
            r.life = 0; r.ttl = rand(200, 500);
            r.speed = rand(0.02, 0.09) * (Math.random() < 0.5 ? 1 : -1); // horizontal drift
            r.len = rand(0.25, 0.5); // ray length as fraction of h
            if (first) r.life = rand(0, r.ttl);
        };
        for (let i = 0; i < STAR_COUNT; i++) stars.push({ x: Math.random(), y: Math.random(), z: rand(0.2, 1), tw: rand(0, Math.PI * 2), ts: rand(0.4, 1.4) });

        // perseids: meteors streaking from one radiant, occasionally in small bursts
        const meteors = [];
        let meteorTimer = rand(800, 2200);
        const spawnMeteor = () => {
            const a = rand(0.6, 0.95); // down-right direction
            const speed = rand(0.2, 0.45);
            meteors.push({
                x: rand(-0.1, 0.9), y: rand(-0.1, 0.35),
                vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
                life: 1, decay: rand(0.0004, 0.0008),
                len: rand(140, 260), w: rand(1, 2), age: 0,
            });
        };

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth * dpr; h = canvas.clientHeight * dpr;
            canvas.width = w; canvas.height = h;
            starCanvas.width = w; starCanvas.height = h;
            // keep ray density constant across viewport widths
            const target = Math.max(MIN_RAYS, Math.round(canvas.clientWidth / RAY_SPACING));
            while (rays.length < target) { const r = {}; initRay(r, true); rays.push(r); }
            rays.length = target;
        };
        resize();
        window.addEventListener('resize', resize);

        let t = 0, last = performance.now();
        const step = (now) => {
            const dt = Math.min(now - last, 50); last = now;
            t += dt * 0.00004;
            ctx.clearRect(0, 0, w, h);
            ctx.globalCompositeOperation = 'lighter';
            rays.forEach((r) => {
                r.life += dt * 0.06;
                r.x += r.speed * dt * 0.0001;
                if (r.life > r.ttl || r.x < -0.05 || r.x > 1.05) initRay(r, false);
                const x = r.x * w;
                // noise lifts/drops the whole ray, evolving over time
                const n = (n2(r.x * 5 + r.seed, t * 2.2) - 0.5) * h * 0.22;
                const y1 = h * 0.5 + n + r.len * h * 0.5;
                const y0 = y1 - r.len * h;
                const fadeA = Math.sin((r.life / r.ttl) * Math.PI);
                const g = ctx.createLinearGradient(0, y0, 0, y1);
                const col = (a) => palette(r.hueSeed, a.toFixed(3));
                g.addColorStop(0, col(0));
                g.addColorStop(0.5, col(Math.min(1, 0.34 * fadeA * CONTRAST)));
                g.addColorStop(1, col(0));
                ctx.strokeStyle = g;
                ctx.lineWidth = r.width * dpr;
                ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
            });
            ctx.globalCompositeOperation = 'source-over';

            // stars on the sharp layer
            stx.clearRect(0, 0, w, h);
            stars.forEach((s) => {
                s.tw += s.ts * dt * 0.001;
                stx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(s.tw));
                stx.fillStyle = s.z > 0.75 ? '#f5edc8' : '#e8ecff';
                stx.beginPath(); stx.arc(s.x * w, s.y * h, (0.7 + s.z * 1.4) * dpr, 0, Math.PI * 2); stx.fill();
            });
            stx.globalAlpha = 1;

            // perseids on the sharp layer
            meteorTimer -= dt;
            if (meteorTimer <= 0) {
                const burst = Math.random() < 0.25 ? 2 + Math.floor(rand(0, 2)) : 1;
                for (let i = 0; i < burst; i++) spawnMeteor();
                meteorTimer = rand(1500, 5000);
            }
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                m.x += m.vx * dt * 0.0003 * (h / w); m.y += m.vy * dt * 0.0003; m.life -= m.decay * dt;
                if (m.life <= 0 || m.x > 1.2 || m.y > 1.2) { meteors.splice(i, 1); continue; }
                m.age += dt;
                const mx = m.x * w, my = m.y * h;
                const grow = Math.min(1, m.age / 2200); // tail grows over ~2.2s
                const tail = m.len * dpr * (0.15 + 0.85 * grow);
                const tx = mx - m.vx * tail, ty = my - m.vy * tail;
                const g = stx.createLinearGradient(tx, ty, mx, my);
                g.addColorStop(0, 'rgba(236,229,195,0)');
                g.addColorStop(0.7, `rgba(240,235,205,${(0.5 * m.life).toFixed(3)})`);
                g.addColorStop(1, `rgba(255,252,235,${Math.min(1, 1.2 * m.life).toFixed(3)})`);
                stx.strokeStyle = g; stx.lineWidth = m.w * dpr; stx.lineCap = 'round';
                stx.beginPath(); stx.moveTo(tx, ty); stx.lineTo(mx, my); stx.stroke();
                // bright head with glow
                const hg = stx.createRadialGradient(mx, my, 0, mx, my, m.w * 6 * dpr);
                hg.addColorStop(0, `rgba(255,250,225,${(0.5 * m.life).toFixed(3)})`);
                hg.addColorStop(1, 'rgba(255,250,225,0)');
                stx.fillStyle = hg;
                stx.beginPath(); stx.arc(mx, my, m.w * 6 * dpr, 0, Math.PI * 2); stx.fill();
                stx.globalAlpha = m.life;
                stx.fillStyle = '#fffdf0';
                stx.beginPath(); stx.arc(mx, my, m.w * 1.5 * dpr, 0, Math.PI * 2); stx.fill();
                stx.globalAlpha = 1;
            }
            raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };

    }, [palette]);

    return <React.Fragment>
        <canvas ref={auroraRef} className='aurora-canvas' />
        <canvas ref={starRef} className='star-canvas' />
        {props.children}
        </React.Fragment>
}

export default Aurora;
