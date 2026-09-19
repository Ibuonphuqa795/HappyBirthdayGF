// Chạm vào trái tim giữa → cả cây nở rộ thêm lần nữa (độc lập với tree.js)
(() => {
    const tree = document.querySelector('.tree');
    const face = tree && tree.querySelector('.face-heart');
    if (!face) return;

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const CENTER = { x: 150, y: 118 };
    const COLORS = ['#FF8FB1', '#FFB6CC', '#F46E97', '#FFD3C0', '#FFC94D', '#FFF0B0', '#ffffff', '#D9C6FF'];
    const HEART = 'M0 .9C-.5.45-1.2 0-1.2-.5-1.2-1-.8-1.25-.45-1.25-.2-1.25 0-1.05 0-.85 0-1.05.2-1.25.45-1.25.8-1.25 1.2-1 1.2-.5 1.2 0 .5.45 0 .9Z';
    const STAR = 'M0-1C.12-.12.12-.12 1 0 .12.12.12.12 0 1-.12.12-.12.12-1 0-.12-.12-.12-.12 0-1Z';
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (list) => list[Math.floor(Math.random() * list.length)];
    // Dọn mảnh hiệu ứng khi animation xong hoặc bị huỷ
    const cleanup = (anim, el) => anim.finished.then(() => el.remove(), () => el.remove());

    // Hướng bung của từng trái tim: tính từ tâm tán ra, đổi về hệ toạ độ riêng của tim
    const leaves = [...tree.querySelectorAll('.leaves .leaf')].map((leaf) => {
        const attr = leaf.parentNode.getAttribute('transform') || '';
        const num = (re) => Number((attr.match(re) || [])[1] || 0);
        const x = num(/translate\(([-\d.]+)/);
        const y = num(/translate\([-\d.]+[ ,]+([-\d.]+)/);
        const rot = num(/rotate\(([-\d.]+)/) * Math.PI / 180;
        const scale = num(/scale\(([-\d.]+)/) || 1;
        const vx = x - CENTER.x;
        const vy = y - CENTER.y;
        const dist = Math.hypot(vx, vy) || 1;
        const push = 14 + dist * 0.12;
        const gx = (vx / dist) * push;
        const gy = (vy / dist) * push;
        // Xoay ngược & chia tỉ lệ để dịch chuyển đúng hướng trong hệ toạ độ của tim
        const lx = (gx * Math.cos(-rot) - gy * Math.sin(-rot)) / scale;
        const ly = (gx * Math.sin(-rot) + gy * Math.cos(-rot)) / scale;
        return { leaf, lx, ly, delay: dist * 2.2 };
    });

    const fxLayer = tree.querySelector('.bloom-fx');
    const flash = tree.querySelector('.bloom-flash');

    function burstLeaves() {
        leaves.forEach(({ leaf, lx, ly, delay }) => {
            const spin = rand(-25, 25);
            leaf.animate([
                { transform: 'translate(0, 0) scale(1) rotate(0deg)' },
                { transform: `translate(${lx}px, ${ly}px) scale(1.3) rotate(${spin}deg)`, offset: 0.35, easing: 'ease-out' },
                { transform: `translate(${-lx * 0.15}px, ${-ly * 0.15}px) scale(0.92) rotate(${-spin * 0.4}deg)`, offset: 0.7 },
                { transform: 'translate(0, 0) scale(1) rotate(0deg)' }
            ], { duration: 1100, delay: 120 + delay, easing: 'cubic-bezier(0.34, 1.2, 0.64, 1)' });
        });
    }

    function popFace() {
        face.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.78, 0.86)', offset: 0.15 },
            { transform: 'scale(1.4) rotate(-6deg)', offset: 0.42 },
            { transform: 'scale(0.94) rotate(3deg)', offset: 0.7 },
            { transform: 'scale(1)' }
        ], { duration: 950, easing: 'ease-out' });
    }

    function flashAndRings() {
        flash.animate([
            { opacity: 0, transform: 'scale(0.3)' },
            { opacity: 1, transform: 'scale(1.6)', offset: 0.3 },
            { opacity: 0, transform: 'scale(3.2)' }
        ], { duration: 1200, easing: 'ease-out' });

        [0, 220].forEach((delay) => {
            const ring = document.createElementNS(SVG_NS, 'circle');
            ring.setAttribute('cx', CENTER.x);
            ring.setAttribute('cy', CENTER.y);
            ring.setAttribute('r', 30);
            ring.setAttribute('fill', 'none');
            ring.setAttribute('stroke', '#fff');
            ring.setAttribute('stroke-width', 2);
            ring.setAttribute('opacity', 0);
            ring.setAttribute('vector-effect', 'non-scaling-stroke');
            ring.style.transformBox = 'fill-box';
            ring.style.transformOrigin = 'center';
            fxLayer.appendChild(ring);
            cleanup(ring.animate([
                { transform: 'scale(0.4)', opacity: 1 },
                { transform: 'scale(5)', opacity: 0 }
            ], { duration: 1300, delay, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }), ring);
        });
    }

    function sparks() {
        const count = 26;
        for (let i = 0; i < count; i++) {
            const piece = document.createElementNS(SVG_NS, 'path');
            piece.setAttribute('d', i % 3 === 0 ? STAR : HEART);
            piece.setAttribute('fill', pick(COLORS));
            piece.setAttribute('opacity', 0);
            fxLayer.appendChild(piece);
            const angle = (i / count) * Math.PI * 2 + rand(-0.15, 0.15);
            const dist = rand(95, 165);
            const dx = Math.cos(angle) * dist;
            const dy = Math.sin(angle) * dist * 0.85;
            const size = rand(3.5, 7);
            const at = (fx, fy, s, r) => `translate(${CENTER.x + fx}px, ${CENTER.y + fy}px) rotate(${r}deg) scale(${s})`;
            cleanup(piece.animate([
                { transform: at(0, 0, 0, 0), opacity: 1 },
                { transform: at(dx * 0.75, dy * 0.75, size, 120), opacity: 1, offset: 0.45 },
                { transform: at(dx, dy + 40, size * 0.5, 260), opacity: 0 }
            ], { duration: rand(1200, 1700), delay: rand(0, 150), easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'backwards' }), piece);
        }
    }

    function heartConfetti() {
        if (typeof window.confetti !== 'function') return;
        const rect = face.getBoundingClientRect();
        const origin = {
            x: (rect.left + rect.width / 2) / innerWidth,
            y: (rect.top + rect.height / 2) / innerHeight
        };
        const shapes = confetti.shapeFromPath
            ? [confetti.shapeFromPath({ path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z' })]
            : ['circle'];
        confetti({
            particleCount: 45,
            spread: 360,
            startVelocity: 28,
            gravity: 0.7,
            scalar: 1.4,
            ticks: 180,
            shapes,
            colors: ['#FF8FB1', '#FFB6CC', '#F46E97', '#FFC94D', '#ffffff'],
            origin,
            zIndex: 50
        });
    }

    // Các lá thư treo rung lắc theo cơn "gió" nở rộ
    function shakeLetters() {
        tree.querySelectorAll('.hang').forEach((hang, i) => {
            const swing = rand(14, 24) * (i % 2 ? 1 : -1);
            hang.animate([
                { transform: 'rotate(0deg)' },
                { transform: `rotate(${swing}deg)`, offset: 0.25 },
                { transform: `rotate(${-swing * 0.6}deg)`, offset: 0.55 },
                { transform: `rotate(${swing * 0.25}deg)`, offset: 0.8 },
                { transform: 'rotate(0deg)' }
            ], { duration: 1400, delay: 150 + i * 30, easing: 'ease-out' });
        });
    }

    function bloom() {
        tree.classList.add('tapped');
        if (reduceMotion) return;
        popFace();
        flashAndRings();
        burstLeaves();
        shakeLetters();
        sparks();
        setTimeout(heartConfetti, 250);
    }

    face.addEventListener('click', bloom);
    face.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            bloom();
        }
    });
})();
