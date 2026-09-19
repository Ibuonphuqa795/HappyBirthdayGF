// Vệt lấp lánh & tim bắn ra theo con trỏ — chỉ để trang trí, độc lập với mọi logic khác
(() => {
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    const trailItems = ['💗', '✨', '💕', '⭐', '🌸', '💖'];
    const popItems = ['💗', '💖', '💕', '✨', '🩷'];
    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    function spawn(className, text, x, y, size, vars) {
        const el = document.createElement('span');
        el.className = className;
        el.textContent = text;
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        el.style.fontSize = size + 'px';
        for (const [key, value] of Object.entries(vars)) el.style.setProperty(key, value);
        el.addEventListener('animationend', () => el.remove());
        document.body.appendChild(el);
    }

    if (finePointer) {
        let last = 0;
        addEventListener('pointermove', (e) => {
            const now = performance.now();
            if (now - last < 50) return;
            last = now;
            spawn('cursor-trail', pick(trailItems), e.clientX, e.clientY + 10, 10 + Math.random() * 8, {
                '--dx': (Math.random() * 30 - 15) + 'px',
                '--rot': (Math.random() * 80 - 40) + 'deg'
            });
        }, { passive: true });
    }

    addEventListener('pointerdown', (e) => {
        const count = 7;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
            const dist = 40 + Math.random() * 30;
            spawn('cursor-pop', pick(popItems), e.clientX, e.clientY, 12 + Math.random() * 8, {
                '--dx': Math.cos(angle) * dist + 'px',
                '--dy': Math.sin(angle) * dist + 'px',
                '--rot': (Math.random() * 120 - 60) + 'deg'
            });
        }
    }, { passive: true });
})();
