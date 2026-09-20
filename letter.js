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
        // Đọc hết thư rồi mới cất → hiện màn kết thúc
        if (finished) setTimeout(showEnding, 350);
    }

    /* ---------- 🎂 Màn kết thúc ---------- */
    const ending = document.querySelector('.ending');
    let endingTimers = [];

    function heartRain() {
        if (typeof window.confetti !== 'function') return;
        const heart = confetti.shapeFromPath
            ? confetti.shapeFromPath({ path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z' })
            : 'circle';
        const colors = ['#FF8FB1', '#FFB6CC', '#F46E97', '#FFE08A', '#C9B2FF', '#ffffff'];
        const end = Date.now() + 2600;
        (function frame() {
            confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, shapes: [heart, 'circle'], colors, scalar: 1.3, zIndex: 300 });
            confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, shapes: [heart, 'circle'], colors, scalar: 1.3, zIndex: 300 });
            if (Date.now() < end) requestAnimationFrame(frame);
        })();
        // Tiếng "bụp" gọi NGAY SÁT lệnh bắn pháo giấy thì tiếng với hình mới cùng một nhịp
        if (window.QBSfx) window.QBSfx.firework(0.9);
        confetti({ particleCount: 90, spread: 110, startVelocity: 38, origin: { x: 0.5, y: 0.45 }, shapes: [heart], colors, scalar: 1.6, zIndex: 300 });

        // Thêm mấy cú nổ nhỏ rải rác cho rôm rả, nhỏ dần rồi tắt.
        // Mỗi tiếng đều đi kèm một chùm tim bung ra đúng chỗ đó, không để tiếng nổ suông.
        [
            { t: 620,  x: 0.24, y: 0.36, v: 0.62 },
            { t: 1260, x: 0.76, y: 0.3,  v: 0.54 },
            { t: 1900, x: 0.5,  y: 0.24, v: 0.46 }
        ].forEach(({ t, x, y, v }) => {
            endingTimers.push(setTimeout(() => {
                if (window.QBSfx) window.QBSfx.firework(v);
                confetti({
                    particleCount: 26, spread: 360, startVelocity: 17, decay: 0.9, gravity: 0.5,
                    ticks: 100, scalar: 1.1, shapes: [heart, 'circle'], colors,
                    origin: { x, y }, zIndex: 300
                });
            }, t));
        });
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
