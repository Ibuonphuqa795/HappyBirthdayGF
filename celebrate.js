// Hiệu ứng chúc mừng sinh nhật (trang 1): băng rôn, bong bóng bay, bánh kem thổi nến, pháo giấy
(() => {
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const PASTEL = ['#FF8FB1', '#FFC8D8', '#FFB38A', '#FFE08A', '#C9B2FF', '#BDF0E0', '#ffffff'];
    const BALLOON_COLORS = ['#FF8FB1', '#FFB3C9', '#C9B2FF', '#FFD08A', '#9FE3CF', '#FFA98F', '#F46E97'];

    /* ---------- Băng rôn cờ đuôi nheo ---------- */
    document.querySelectorAll('.bunting[data-text]').forEach((el) => {
        const chars = [...el.dataset.text];
        const half = (chars.length - 1) / 2;
        const flags = chars.map((ch, i) => {
            const x = ((i - half) / half) * 0.92;
            const text = ch === ' ' ? '♥' : ch;
            const cls = ch === ' ' ? 'flag flag--heart' : 'flag';
            return `<span class="${cls}" style="--i:${i};--x:${x.toFixed(3)}"><b>${text}</b></span>`;
        }).join('');
        el.innerHTML =
            '<svg class="bunting__string" viewBox="0 0 100 1" preserveAspectRatio="none" aria-hidden="true">' +
            '<path d="M0 0Q50 2 100 0" vector-effect="non-scaling-stroke"/></svg>' + flags;
        el.setAttribute('aria-label', el.dataset.text);
    });

    /* ---------- Bong bóng bay ---------- */
    document.querySelectorAll('.balloons[data-count]').forEach((box) => {
        const count = Number(box.dataset.count) || 6;
        for (let i = 0; i < count; i++) {
            const b = document.createElement('span');
            b.className = 'balloon';
            const size = 44 + Math.random() * 30;
            const duration = 11 + Math.random() * 8;
            b.style.setProperty('--c', BALLOON_COLORS[i % BALLOON_COLORS.length]);
            b.style.setProperty('--size', size + 'px');
            // Dồn bong bóng ra hai mép để không che chữ ở giữa
            const side = i % 2 === 0 ? Math.random() * 20 : 80 + Math.random() * 16;
            b.style.setProperty('--left', side + '%');
            b.style.setProperty('--dur', duration + 's');
            b.style.setProperty('--delay', -Math.random() * duration + 's');
            b.style.setProperty('--sway', (14 + Math.random() * 24) * (Math.random() < 0.5 ? -1 : 1) + 'px');
            box.appendChild(b);
        }
    });

    /* ---------- Pháo giấy (canvas-confetti) ---------- */
    const hasConfetti = typeof window.confetti === 'function' && !reduceMotion;
    let heartShape = null;
    if (hasConfetti && confetti.shapeFromPath) {
        heartShape = confetti.shapeFromPath({
            path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z'
        });
    }
    const shapes = heartShape ? [heartShape, 'circle', 'square'] : ['circle', 'square'];

    function burst(opts = {}) {
        if (!hasConfetti) return;
        confetti(Object.assign({
            particleCount: 90,
            spread: 80,
            startVelocity: 42,
            scalar: 1.1,
            colors: PASTEL,
            shapes,
            zIndex: 10000,
            origin: { x: 0.5, y: 0.6 }
        }, opts));
    }

    function celebrate() {
        burst({ origin: { x: 0.5, y: 0.55 }, particleCount: 120, spread: 100 });
        setTimeout(() => burst({ angle: 60, origin: { x: 0, y: 0.75 }, particleCount: 70 }), 250);
        setTimeout(() => burst({ angle: 120, origin: { x: 1, y: 0.75 }, particleCount: 70 }), 450);
        if (heartShape) {
            setTimeout(() => burst({ shapes: [heartShape], particleCount: 40, scalar: 1.8, spread: 140, startVelocity: 30, origin: { x: 0.5, y: 0.4 } }), 800);
        }
    }

    /* ---------- 🎆 Pháo hoa ---------- */
    const FIREWORK_PALETTES = [
        ['#FF8FB1', '#FFC8D8', '#ffffff', '#FFE08A'],
        ['#C9B2FF', '#E0D1FF', '#ffffff', '#FF8FB1'],
        ['#FFD08A', '#FFE08A', '#FFA98F', '#ffffff'],
        ['#9FE3CF', '#BDF0E0', '#ffffff', '#FFC8D8'],
        ['#F46E97', '#FFB3C9', '#FFE27A', '#ffffff']
    ];
    const pickPalette = () => FIREWORK_PALETTES[Math.floor(Math.random() * FIREWORK_PALETTES.length)];
    const sparkShapes = heartShape ? ['star', 'circle', heartShape] : ['star', 'circle'];

    // Ánh loé sáng ngay tâm vụ nổ — trùng khoảnh khắc tiếng "bùm"
    function flash(x, y, color, size) {
        const el = document.createElement('span');
        el.className = 'fw-flash';
        el.style.left = x * innerWidth + 'px';
        el.style.top = y * innerHeight + 'px';
        el.style.setProperty('--c', color);
        el.style.setProperty('--s', size);
        el.addEventListener('animationend', () => el.remove());
        document.body.appendChild(el);
    }

    // Một quả pháo hoa nổ tại (x, y) — toạ độ 0 → 1 theo màn hình
    // Hình (loé sáng + tia) và tiếng "bùm" được bắn trong CÙNG một lệnh → luôn khớp nhau
    function firework(x, y, { sound = true, size = 1 } = {}) {
        if (!hasConfetti) return;
        const colors = pickPalette();
        const origin = { x, y };
        if (sound && window.QBSfx) window.QBSfx.firework(Math.min(1, 0.55 + size * 0.35));
        flash(x, y, colors[0], size);
        // Vòng nổ chính
        confetti({
            particleCount: Math.round(60 * size), spread: 360, startVelocity: 24 * size,
            decay: 0.91, gravity: 0.55, ticks: 110, scalar: 1.05,
            shapes: sparkShapes, colors, origin, zIndex: 10000
        });
        // Lớp kim tuyến nhỏ li ti lấp lánh
        confetti({
            particleCount: Math.round(40 * size), spread: 360, startVelocity: 14 * size,
            decay: 0.9, gravity: 0.35, ticks: 160, scalar: 0.55,
            shapes: ['circle'], colors: ['#ffffff', '#FFF1B8', colors[0]], origin, zIndex: 10000
        });
    }

    // Quả pháo bay vút lên từ đáy màn hình (kèm tiếng "víu"), tới nơi thì nổ + "bùm"
    function launchRocket(x, y, size = 1) {
        const startX = x * innerWidth + (Math.random() * 80 - 40);
        const endX = x * innerWidth;
        const endY = y * innerHeight;
        const duration = 650 + Math.random() * 250;
        const rocket = document.createElement('span');
        rocket.className = 'fw-rocket';
        rocket.style.left = '0px';
        rocket.style.top = '0px';
        document.body.appendChild(rocket);
        if (window.QBSfx) window.QBSfx.launch(duration / 1000, size);
        const anim = rocket.animate([
            { transform: `translate(${startX}px, ${innerHeight + 20}px)`, opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px)`, opacity: 1 }
        ], { duration, easing: 'cubic-bezier(0.25, 0.6, 0.35, 1)' });
        // Nổ đúng khoảnh khắc quả pháo tới đỉnh
        anim.onfinish = () => {
            rocket.remove();
            firework(x, y, { size });
        };
    }

    // Màn pháo hoa mở màn: các quả pháo lần lượt bay lên và nổ khắp màn hình
    function fireworksShow(duration = 5200) {
        if (!hasConfetti) return;
        const end = Date.now() + duration;
        const shoot = () => {
            if (Date.now() > end) return;
            launchRocket(0.12 + Math.random() * 0.76, 0.12 + Math.random() * 0.36, 0.85 + Math.random() * 0.4);
            // Giãn cách đủ để nghe rõ từng tiếng nổ
            setTimeout(shoot, 480 + Math.random() * 380);
        };
        shoot();
    }

    // Câu chúc mừng bay lên tại chỗ bấm
    const WISHES = [
        'Sinh nhật vui vẻ! 🎂', 'Happy Birthday! 🎉', 'Quỳnh Bếuu xinh nhất ✨', 'Thương em nhiều 💗',
        'Tuổi mới thật rực rỡ 🌸', 'Ăn thật nhiều bánh nha 🍰', 'Luôn cười thật tươi 😊', 'Yêu em 3000 💞'
    ];
    let wishIndex = Math.floor(Math.random() * WISHES.length);
    function wishPop(clientX, clientY) {
        const el = document.createElement('span');
        el.className = 'wish-pop';
        el.textContent = WISHES[wishIndex++ % WISHES.length];
        el.style.left = clientX + 'px';
        el.style.top = clientY + 'px';
        el.style.setProperty('--tilt', (Math.random() * 16 - 8) + 'deg');
        el.addEventListener('animationend', () => el.remove());
        document.body.appendChild(el);
    }

    // Bấm vào màn Happy Birthday → pháo hoa nổ ngay chỗ bấm + câu chúc bay lên
    // (bỏ qua các nút đã có hành động riêng: bánh kem, nút khám phá, thanh điều hướng)
    let lastFire = 0;
    document.addEventListener('pointerdown', (e) => {
        if (!document.body.classList.contains('celebrating') || e.button !== 0) return;
        if (!(e.target instanceof Element)) return;
        if (document.body.classList.contains('shell-framed')) return;
        if (e.target.closest('.page-nav, .cake, .cta-button, .gate, .intro-overlay')) return;
        const now = Date.now();
        if (now - lastFire < 220) return;
        lastFire = now;
        firework(e.clientX / innerWidth, e.clientY / innerHeight);
        wishPop(e.clientX, e.clientY);
    });

    /* ---------- ⌨️ Tiếng gõ phím cho lời chào gõ chữ (script.js) ---------- */
    // Không sửa script.js: chỉ "lắng nghe" mỗi lần có chữ mới hiện ra.
    // Có chữ mới → tiếng gõ phím chạy (typing.js); hết chữ → tự dừng.
    const greeting = document.querySelector('.greeting');
    if (greeting) {
        let shown = 0;
        new MutationObserver(() => {
            const text = greeting.textContent;
            if (text.length > shown && window.QBTyping) window.QBTyping.tick();
            shown = text.length;
        }).observe(greeting, { childList: true, characterData: true, subtree: true });
    }

    /* ---------- Trang 1: mở quà ---------- */
    const giftBtn = document.querySelector('.open-gift-btn');
    if (giftBtn) {
        giftBtn.addEventListener('click', () => {
            document.body.classList.add('celebrating');
            if (window.QBSfx) window.QBSfx.warmUp();
            if (window.QBTyping) window.QBTyping.arm(); // lời chào sắp gõ chữ → chạy sẵn tiếng gõ (tắt tiếng)
            // Đợi hộp quà trượt lên xong rồi mới bắn, để Quỳnh nhìn thấy trọn vẹn
            setTimeout(celebrate, 1200);
            setTimeout(() => fireworksShow(), 1500);
        });
        // Quay lại từ trang sau (index.html#mo-qua) → tự mở quà
        if (location.hash === '#mo-qua') {
            setTimeout(() => giftBtn.click(), 60);
        }
    }

    /* ---------- Trang 1: bánh kem thổi nến ---------- */
    const cake = document.querySelector('.cake');
    const hint = document.querySelector('.cake-hint');
    if (cake) {
        cake.addEventListener('click', () => {
            if (cake.classList.contains('blown')) {
                // Thắp nến lại để thổi thêm lần nữa
                cake.classList.remove('blown');
                if (hint) hint.textContent = 'Nến sáng lại rồi nè, thổi tiếp đi em 🕯️';
                return;
            }
            cake.classList.add('blown');
            if (hint) hint.textContent = 'Yayyy! Điều ước của em chắc chắn thành sự thật 💖';
            celebrate();
            fireworksShow(3000);
        });
    }
})();
