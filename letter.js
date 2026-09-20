// Lá thư bất ngờ sau khi gửi điều ước — độc lập với tree.js
(() => {
    /* =======================================================
       ✍️ NỘI DUNG THƯ — sửa thoải mái theo lời của bạn.
       Mỗi dòng trong mảng là một đoạn. Dòng cuối là chữ ký.
       ======================================================= */
    const LETTER = [
        'Gửi Quỳnh Bếuu của anh,',
        'Hôm nay là ngày đặc biệt nhất trong năm — ngày thế giới có thêm một cô gái đáng yêu, ham ăn và hay dỗi (một xíu thôi) mà anh thương nhất.',
        'Anh biết mình còn nhiều thiếu sót, nhưng anh luôn muốn là người làm em cười nhiều nhất.',
        'Điều ước em vừa gửi, anh nhận được rồi nè. Anh không hứa làm được tất cả ngay, nhưng anh hứa sẽ cố gắng từng chút một, mỗi ngày.',
        'Tuổi mới, chúc em luôn khoẻ mạnh, lúc nào cũng cười thật tươi, và ăn gì cũng ngon mà không lo tăng cân 🍰',
        'Thương em nhiều lắm luôn.',
        '— Anh 💗'
    ];

    const overlay = document.querySelector('.letter-overlay');
    const openBtn = document.querySelector('.letter-open-btn');
    if (!overlay || !openBtn) return;

    const textBox = overlay.querySelector('.letter-text');
    const skipBtn = overlay.querySelector('.letter-skip');
    const closeBtn = overlay.querySelector('.letter-close');
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let timer = null;
    let finished = false;

    function renderAll() {
        clearTimeout(timer);
        if (window.QBTyping) window.QBTyping.stop();
        finished = true;
        textBox.innerHTML = '';
        LETTER.forEach((line, i) => {
            const p = document.createElement('p');
            p.textContent = line;
            if (i === LETTER.length - 1) p.className = 'letter-sign';
            textBox.appendChild(p);
        });
        overlay.classList.add('done');
    }

    // Hiện từng chữ như đang viết tay
    function typeLetter() {
        finished = false;
        overlay.classList.remove('done');
        textBox.innerHTML = '';
        let line = 0;
        let char = 0;
        let p = null;

        const step = () => {
            if (line >= LETTER.length) {
                if (window.QBTyping) window.QBTyping.end(); // viết xong cả lá thư → tắt tiếng gõ
                finished = true;
                overlay.classList.add('done');
                return;
            }
            if (!p) {
                p = document.createElement('p');
                if (line === LETTER.length - 1) p.className = 'letter-sign';
                textBox.appendChild(p);
            }
            const chars = [...LETTER[line]];
            p.textContent = chars.slice(0, ++char).join('');
            // Chữ đầu tiên hiện ra → tiếng gõ chạy liên tục cho tới hết lá thư (typing.js)
            if (line === 0 && char === 1 && window.QBTyping) window.QBTyping.begin();
            // Nhịp gõ lúc nhanh lúc chậm như người gõ thật
            let delay = 42 + Math.random() * 45;
            if (char >= chars.length) {
                line++;
                char = 0;
                p = null;
                delay = 420;
            } else if (/[,.!—]/.test(chars[char - 1])) {
                delay = 220;
            }
            textBox.scrollTop = textBox.scrollHeight;
            timer = setTimeout(step, delay);
        };
        timer = setTimeout(step, 1100); // đợi phong bì mở xong
    }

    function open() {
        overlay.hidden = false;
        document.body.classList.add('letter-open');
        closeBtn.focus();
        if (reduceMotion) renderAll();
        else {
            if (window.QBTyping) window.QBTyping.arm(); // thư sắp gõ chữ → chạy sẵn tiếng gõ (tắt tiếng)
            typeLetter();
        }
    }

    function close() {
        clearTimeout(timer);
        if (window.QBTyping) window.QBTyping.stop();
        overlay.hidden = true;
        document.body.classList.remove('letter-open');
        openBtn.focus();
        // Cất thư là hiện màn kết thúc (không cần đợi chữ gõ xong)
        setTimeout(showEnding, 350);
    }

    /* ---------- 🎂 Màn kết thúc ---------- */
    const ending = document.querySelector('.ending');
    let endingTimers = [];

    // Máy cảm ứng (iPhone/iPad) yếu hơn → bắn ít hạt hơn, nhưng vẫn giữ đúng nhịp pháo
    const lightDevice = matchMedia('(max-width: 640px), (hover: none)').matches;

    const FW_PALETTES = [
        ['#FF8FB1', '#FFC8D8', '#ffffff', '#FFE08A'],
        ['#C9B2FF', '#E0D1FF', '#ffffff', '#FF8FB1'],
        ['#FFD08A', '#FFE08A', '#FFA98F', '#ffffff'],
        ['#9FE3CF', '#BDF0E0', '#ffffff', '#FFC8D8'],
        ['#F46E97', '#FFB3C9', '#FFE27A', '#ffffff']
    ];

    // Loé sáng tại chỗ nổ (CSS ở tree.css)
    function fwFlash(x, y, color, size) {
        const el = document.createElement('span');
        el.className = 'fw-flash';
        el.style.left = x * innerWidth + 'px';
        el.style.top = y * innerHeight + 'px';
        el.style.setProperty('--c', color);
        el.style.setProperty('--s', size);
        el.addEventListener('animationend', () => el.remove());
        // Lưới an toàn: tab chạy nền bị trình duyệt bóp animation nên `animationend`
        // có thể không bao giờ chạy — không có dòng này thì quầng sáng nằm lại mãi
        setTimeout(() => el.remove(), 1200);
        document.body.appendChild(el);
    }

    function heartRain() {
        if (typeof window.confetti !== 'function') return;
        const heart = confetti.shapeFromPath
            ? confetti.shapeFromPath({ path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z' })
            : 'circle';
        const colors = ['#FF8FB1', '#FFB6CC', '#F46E97', '#FFE08A', '#C9B2FF', '#ffffff'];
        const shapes = heart === 'circle' ? ['circle', 'star'] : [heart, 'star', 'circle'];
        const at = (t, fn) => endingTimers.push(setTimeout(fn, t));

        // Một quả pháo nổ: loé sáng + hai lớp tia + tiếng "bụp", tất cả trong CÙNG một
        // lệnh nên tiếng luôn khớp với hình
        function boom(x, y, size = 1) {
            const pal = FW_PALETTES[Math.floor(Math.random() * FW_PALETTES.length)];
            if (window.QBSfx) window.QBSfx.firework(Math.min(1, 0.5 + size * 0.42));
            fwFlash(x, y, pal[0], size);
            confetti({
                particleCount: Math.round((lightDevice ? 34 : 62) * size), spread: 360,
                startVelocity: 27 * size, decay: 0.91, gravity: 0.6, ticks: 140, scalar: 1.15,
                shapes, colors: pal, origin: { x, y }, zIndex: 300
            });
            confetti({
                particleCount: Math.round((lightDevice ? 18 : 38) * size), spread: 360,
                startVelocity: 14 * size, decay: 0.9, gravity: 0.38, ticks: 190, scalar: 0.6,
                shapes: ['circle'], colors: ['#ffffff', '#FFF1B8', pal[0]],
                origin: { x, y }, zIndex: 300
            });
        }

        /* --- Mở màn: ba quả dồn dập --- */
        boom(0.5, 0.42, 1.35);
        at(180, () => boom(0.2, 0.3, 1.1));
        at(360, () => boom(0.8, 0.28, 1.1));

        /* --- Mưa tim hai bên, kéo dài suốt màn pháo ---
           Nhả theo NHỊP THỜI GIAN chứ không phải mỗi khung hình: bắn mỗi khung hình
           là khoảng 180 hạt/giây mỗi bên, kín đặc cả màn hình. */
        const rainEnd = Date.now() + (lightDevice ? 4200 : 6000);
        let lanCuoi = 0;
        (function frame() {
            if (ending.hidden) return; // đóng màn kết thì ngừng luôn
            const now = Date.now();
            if (now - lanCuoi >= 170) {
                lanCuoi = now;
                const n = lightDevice ? 1 : 2;
                confetti({ particleCount: n, angle: 60, spread: 55, origin: { x: 0, y: 0.72 }, shapes: [heart, 'circle'], colors, scalar: 1.3, zIndex: 300 });
                confetti({ particleCount: n, angle: 120, spread: 55, origin: { x: 1, y: 0.72 }, shapes: [heart, 'circle'], colors, scalar: 1.3, zIndex: 300 });
            }
            if (now < rainEnd) requestAnimationFrame(frame);
        })();

        /* --- Màn pháo hoa: nổ liên tục khắp trời --- */
        const showEnd = (lightDevice ? 4200 : 6200);
        let t = 700;
        while (t < showEnd) {
            const x = 0.1 + Math.random() * 0.8;
            const y = 0.14 + Math.random() * 0.4;
            const size = 0.75 + Math.random() * 0.55;
            at(t, () => boom(x, y, size));
            // Giãn cách đủ để nghe rõ từng tiếng nổ, càng về cuối càng dồn
            t += (lightDevice ? 380 : 260) + Math.random() * 220;
        }

        /* --- Chốt hạ: ba quả cùng lúc --- */
        at(showEnd + 120, () => { boom(0.5, 0.34, 1.5); boom(0.18, 0.24, 1.1); boom(0.82, 0.26, 1.1); });
    }

    function showEnding() {
        if (!ending) return;
        ending.hidden = false;
        document.body.classList.add('ending-open');
        ending.querySelector('.ending-restart').focus();
        if (!reduceMotion) heartRain();
    }

    function hideEnding() {
        // Tắt màn kết sớm thì đừng để mấy tiếng nổ đã hẹn giờ nổ tiếp trong im lặng
        endingTimers.forEach(clearTimeout);
        endingTimers = [];
        document.querySelectorAll('.fw-flash').forEach((el) => el.remove());
        ending.hidden = true;
        document.body.classList.remove('ending-open');
        // Ẩn luôn modal "Đã Gửi Thành Công!" để người dùng ngắm cây trọn vẹn
        const successModal = document.querySelector('.modal');
        if (successModal) {
            successModal.style.display = 'none';
        }
    }

    if (ending) {
        ending.querySelector('.ending-stay').addEventListener('click', hideEnding);
        ending.querySelector('.ending-restart').addEventListener('click', () => {
            hideEnding();
            // Về trang chủ (trong khung của shell.js thì về màn Happy Birthday, nhạc không bị ngắt)
            let shell = null;
            try { shell = window.top.QBShell || null; } catch (e) { shell = null; }
            if (shell) shell.home();
            else location.href = 'index.html';
        });
        ending.addEventListener('click', (e) => { if (e.target === ending) hideEnding(); });
    }

    openBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    skipBtn.addEventListener('click', renderAll);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    // Bấm vào tờ thư khi đang viết → hiện hết luôn
    textBox.addEventListener('click', () => { if (!finished) renderAll(); });
    addEventListener('keydown', (e) => {
        if (!overlay.hidden && e.key === 'Escape') close();
        else if (ending && !ending.hidden && e.key === 'Escape') hideEnding();
    });
})();
