// Trang Album: ảnh rải kiểu collage / xếp gọn, kéo thả, xem ảnh to, mưa đồ ăn
(() => {
    /* =======================================================
       📷 DANH SÁCH ẢNH
       Bỏ ảnh vào thư mục album/ rồi khai báo ở đây, ví dụ:
         { src: 'album/01.jpg', caption: 'Lần đầu đi ăn lẩu 🍲' },
       Khi danh sách còn trống, trang hiện ảnh mẫu để xem trước bố cục.
       ======================================================= */
    const PHOTOS = [
        { src: 'album/01.jpg', caption: 'Hai đứa đi sở thú nè 🦁' },
        { src: 'album/02.jpg', caption: 'Chỉ anh xem bạn khỉ nè 🐒' },
        { src: 'album/03.jpg', caption: 'Sở thú xanh mát rượi 🍃' },
        { src: 'album/04.jpg', caption: 'Bé xíu giữa rừng cây sở thú 🌴' },
        { src: 'album/05.jpg', caption: 'Ngồi xổm ngắm thú cưng 🐾' },
        { src: 'album/06.jpg', caption: 'Chụp cùng bạn hươu cao cổ 🦒' },
        { src: 'album/07.jpg', caption: 'Đi chơi phố nè 👜' },
        { src: 'album/08.jpg', caption: 'Selfie hai đứa 📸' },
        { src: 'album/09.jpg', caption: 'Đi ăn lẩu nè 🍲' },
        { src: 'album/10.jpg', caption: 'Pizza tối nay 🍕' },
        { src: 'album/11.jpg', caption: 'Ăn no căng bụng 🍝' },
        { src: 'album/12.jpg', caption: 'Ngại ngùng xíu thôi 🙈' },
        { src: 'album/13.jpg', caption: 'Tối lung linh bên nhau ✨' },
        { src: 'album/14.jpg', caption: 'Thêm một tấm nữa nha 💫' },
        { src: 'album/15.jpg', caption: 'Thành phố về đêm 🌃' },
        { src: 'album/16.jpg', caption: 'Gặp nhau rồi nè ✌️' },
        { src: 'album/17.jpg', caption: 'Sắp cất cánh rồi ✈️' },
        { src: 'album/18.jpg', caption: 'Tráng miệng ngọt ngào 🍓' },
        { src: 'album/19.jpg', caption: 'Nướng xèo xèo 🍢' },
        { src: 'album/20.jpg', caption: 'Đêm lên đồi 🌙' },
        { src: 'album/21.jpg', caption: 'Ngồi nghỉ chân nè 😷' },
        { src: 'album/22.jpg', caption: 'Giữa trời mây xanh ☁️' },
        { src: 'album/23.jpg', caption: 'Tạo dáng giấu mặt 😝' },
        { src: 'album/24.jpg', caption: 'Ghế đá chờ anh 🪑' },
        { src: 'album/25.jpg', caption: 'Mâm cơm đầy ắp 🍛' },
        { src: 'album/26.jpg', caption: 'Bó hoa xinh xinh 💐' },
        { src: 'album/27.jpg', caption: 'Bình minh trên đường đi 🌅' },
        { src: 'album/28.jpg', caption: 'Biển mây buổi sáng ☁️' },
        { src: 'album/29.jpg', caption: 'Bạn ngựa đi dạo 🐴' },
        { src: 'album/30.jpg', caption: 'Tung tăng giữa đồi gió 🌬️' },
        { src: 'album/31.jpg', caption: 'Dâu tây chín đỏ 🍓' },
        { src: 'album/32.jpg', caption: 'Ăn vặt nè 🌭' },
        { src: 'album/33.jpg', caption: 'Gặp bé mèo ven đường 🐈' },
        { src: 'album/34.jpg', caption: 'Hai đứa phiên bản gấu 🐻' },
        { src: 'album/35.jpg', caption: 'Bạn nhỏ mũm mĩm 🐹' },
        { src: 'album/36.jpg', caption: 'Hai bạn chuột lang 🐹' },
        { src: 'album/37.jpg', caption: 'Lạc đà ngơ ngác 🐪' },
        { src: 'album/38.jpg', caption: 'Mẹt đồ ăn khổng lồ 🥗' },
        { src: 'album/39.jpg', caption: 'Nồi lẩu nóng hổi 🍲' },
        { src: 'album/40.jpg', caption: 'Bánh mì chấm ngon lành 🥖' },
        { src: 'album/41.jpg', caption: 'Đống lửa ấm áp 🔥' },
        { src: 'album/42.jpg', caption: 'Pizza siêu to 🍕' },
        { src: 'album/43.jpg', caption: 'Khăn choàng xinh xinh 🧣' },
        { src: 'album/44.jpg', caption: 'Rừng thông mát lạnh 🌲' },
        { src: 'album/45.jpg', caption: 'Hai đứa mình 💑' },
        { src: 'album/46.jpg', caption: 'Kỷ niệm nhỏ xinh 💗' }
    ];
    const PLACEHOLDER_COUNT = 18;

    /* =======================================================
       🎬 DANH SÁCH VIDEO
       Bỏ file video (.mp4) vào thư mục album/videos/ rồi khai báo ở đây, ví dụ:
         { src: 'album/videos/chuc-mung.mp4', caption: 'Lời chúc của anh 💌' },
       (poster: ảnh bìa tuỳ chọn, vd 'album/01.jpg')
       Danh sách trống → Quỳnh không thấy mục video; riêng chế độ xem trước (?xem-truoc)
       sẽ hiện khung hướng dẫn để bạn biết video nằm ở đâu.
       ======================================================= */
    const VIDEOS = [
        { src: 'album/videos/01.mp4', poster: 'album/videos/01.jpg', caption: 'Đỉnh đồi lộng gió ⛰️' },
        { src: 'album/videos/02.mp4', poster: 'album/videos/02.jpg', caption: 'Em giữa rừng xanh 🌿' },
        { src: 'album/videos/03.mp4', poster: 'album/videos/03.jpg', caption: 'Phượt cùng nhau 🏍️' },
        { src: 'album/videos/04.mp4', poster: 'album/videos/04.jpg', caption: 'Ngắm mây trên máy bay ✈️' },
        { src: 'album/videos/05.mp4', poster: 'album/videos/05.jpg', caption: 'Đi chơi đêm đông vui 🌃' },
        { src: 'album/videos/06.mp4', poster: 'album/videos/06.jpg', caption: 'Đi săn mây bình minh 🌄' }
    ];

    const FOODS = ['🍰', '🍩', '🍓', '🧋', '🍡', '🍪', '🍫', '🍦', '🍭', '🍬', '🧁', '🍮', '🍕', '🍔',
        '🍟', '🍙', '🍜', '🍣', '🍤', '🥞', '🧇', '🍑', '🍒', '🥐', '🍿', '🍉'];
    const PASTELS = [['#FFE4EC', '#FFC2D4'], ['#F1EAFF', '#D9C6FF'], ['#FFF1DC', '#FFD9A8'],
        ['#DDF6EE', '#B5EAD7'], ['#FFE9E0', '#FFC6B0']];
    const TAPES = ['rgba(255, 200, 216, 0.9)', 'rgba(201, 178, 255, 0.9)',
        'rgba(200, 242, 228, 0.95)', 'rgba(255, 239, 181, 0.95)'];

    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rand = (a, b) => a + Math.random() * (b - a);
    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    const items = PHOTOS.length
        ? PHOTOS
        : Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => ({ caption: `Kỷ niệm #${i + 1}` }));

    const board = document.querySelector('.board');

    /* ---------- Ảnh ---------- */
    function showPlaceholder(frame, i) {
        const [a, b] = PASTELS[i % PASTELS.length];
        frame.classList.add('is-placeholder');
        frame.style.setProperty('--pa', a);
        frame.style.setProperty('--pb', b);
        frame.innerHTML =
            `<span class="ph-emoji">${FOODS[(i * 5 + 3) % FOODS.length]}</span>` +
            '<span class="ph-text">ảnh sắp có 💗</span>';
    }

    // Ô album dùng ảnh thu nhỏ (nhẹ cho điện thoại); xem ảnh to mới tải ảnh lớn
    const thumbOf = (src) => src.replace('album/', 'album/thumbs/');

    // Chỉ tải ảnh khi sắp cuộn tới, tính theo VỊ TRÍ BỐ CỤC (offsetTop) chứ không theo
    // vị trí đang vẽ: lúc mở trang các tấm đang bay từ giữa ra nên nhìn thì tấm nào
    // cũng "trong màn hình", dễ khiến trình duyệt tải hết 46 ảnh một lúc.
    const lazyQueue = [];

    function pumpLazy() {
        if (!lazyQueue.length) return;
        const boardTop = board.offsetTop;
        // Tải mọi ảnh từ đáy màn hình trở lên (kể cả ảnh đã lướt qua) — cuộn nhanh
        // cũng không bỏ sót tấm nào
        const max = window.scrollY + window.innerHeight + 700;
        for (let i = lazyQueue.length - 1; i >= 0; i--) {
            const { img, src } = lazyQueue[i];
            const card = img.closest('.photo');
            if (!card) continue;
            if (boardTop + card.offsetTop > max) continue;
            img.src = src;
            delete img.dataset.src;
            lazyQueue.splice(i, 1);
        }
    }

    let pumpPending = false;
    function queuePump() {
        if (pumpPending) return;
        pumpPending = true;
        const run = () => {
            if (!pumpPending) return;
            pumpPending = false;
            pumpLazy();
        };
        requestAnimationFrame(run);
        setTimeout(run, 120); // phòng khi trình duyệt tạm dừng requestAnimationFrame
    }

    function fillPhoto(frame, item, i, large) {
        frame.innerHTML = '';
        frame.classList.remove('is-placeholder');
        if (!item.src) {
            showPlaceholder(frame, i);
            return;
        }
        const img = new Image();
        img.alt = item.caption || `Ảnh ${i + 1}`;
        if (!large) img.sizes = '(max-width: 640px) 45vw, 200px';
        img.decoding = 'async';
        img.loading = 'lazy';
        img.draggable = false;
        img.onerror = () => showPlaceholder(frame, i);
        const src = large ? item.src : thumbOf(item.src);
        frame.appendChild(img);
        if (large) {
            img.src = src;
        } else {
            img.dataset.src = src;
            lazyQueue.push({ img, src });
        }
    }

    function makeCard(item, i) {
        const card = document.createElement('figure');
        card.className = 'photo';
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Xem ảnh ${i + 1}${item.caption ? ': ' + item.caption : ''}`);
        card.dataset.index = i;
        card.style.setProperty('--tape', TAPES[i % TAPES.length]);
        card.style.setProperty('--gr', ((i % 2 ? 2 : -2) + rand(-1, 1)).toFixed(1) + 'deg');
        // Độ lệch ngẫu nhiên cố định cho mỗi ảnh (để bố cục không nhảy khi tính lại)
        card._jit = { x: rand(-1, 1), y: rand(-1, 1), r: rand(-13, 13) };

        const frame = document.createElement('div');
        frame.className = 'photo__img';
        fillPhoto(frame, item, i);

        const cap = document.createElement('figcaption');
        cap.className = 'photo__cap';
        cap.textContent = item.caption || `Kỷ niệm #${i + 1}`;

        const sticker = document.createElement('span');
        sticker.className = 'photo__sticker' + (i % 3 === 1 ? ' photo__sticker--left' : '');
        sticker.textContent = FOODS[(i * 7) % FOODS.length];
        sticker.setAttribute('aria-hidden', 'true');

        card.append(frame, cap, sticker);
        return card;
    }

    const cards = items.map(makeCard);
    cards.forEach((c) => board.appendChild(c));
    let order = cards.map((_, i) => i);

    window.addEventListener('scroll', queuePump, { passive: true });
    window.addEventListener('resize', queuePump);

    /* ---------- Bố cục "rải ảnh" ---------- */
    function layoutScatter() {
        const W = board.clientWidth;
        const cw = cards[0].offsetWidth;
        const ch = cards[0].offsetHeight;
        const cols = Math.max(2, Math.min(8, Math.floor(W / (cw * 0.8))));
        const stepX = (W - cw) / (cols - 1);
        const stepY = ch * 0.72;

        order.forEach((cardIndex, slot) => {
            const card = cards[cardIndex];
            const row = Math.floor(slot / cols);
            const col = slot % cols;
            const shift = row % 2 ? stepX * 0.3 : 0;
            const x = Math.max(0, Math.min(W - cw, col * stepX + shift + card._jit.x * stepX * 0.18));
            const y = Math.max(0, row * stepY + card._jit.y * stepY * 0.12 + 16);
            card.style.left = x + 'px';
            card.style.top = y + 'px';
            card.style.setProperty('--r', card._jit.r.toFixed(1) + 'deg');
            card.style.zIndex = slot + 1;
        });

        const rows = Math.ceil(cards.length / cols);
        board.style.height = (rows - 1) * stepY + ch + 60 + 'px';
    }

    // Hiệu ứng FLIP: ảnh bay mượt từ vị trí cũ sang vị trí mới
    function flip(mutate) {
        const first = cards.map((c) => [c.offsetLeft, c.offsetTop]);
        mutate();
        queuePump();
        cards.forEach((c, i) => {
            const dx = first[i][0] - c.offsetLeft;
            const dy = first[i][1] - c.offsetTop;
            if (!dx && !dy) return;
            c.animate(
                [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0, 0)' }],
                {
                    duration: reduceMotion ? 0 : 750,
                    delay: reduceMotion ? 0 : (i % 12) * 25,
                    easing: 'cubic-bezier(0.34, 1.25, 0.64, 1)',
                    fill: 'backwards'
                }
            );
        });
    }

    // Mở trang: ảnh bay ra từ giữa như chia bài
    function dealIn() {
        if (reduceMotion) return;
        const cx = board.clientWidth / 2;
        const cy = Math.min(board.clientHeight / 2, 240);
        // Điện thoại: chỉ "chia bài" những tấm đầu nhìn thấy được, tránh 46 animation cùng lúc
        const limit = matchMedia('(max-width: 640px)').matches ? 8 : cards.length;
        cards.slice(0, limit).forEach((c, i) => {
            const dx = cx - (c.offsetLeft + c.offsetWidth / 2);
            const dy = cy - (c.offsetTop + c.offsetHeight / 2);
            c.animate(
                [
                    { transform: `translate(${dx}px, ${dy}px) scale(0.3) rotate(${rand(-40, 40)}deg)`, opacity: 0 },
                    { transform: 'none', opacity: 1 }
                ],
                { duration: 850, delay: 250 + i * 70, easing: 'cubic-bezier(0.34, 1.4, 0.64, 1)', fill: 'backwards' }
            );
        });
    }

    /* ---------- Nút chọn cách xem ---------- */
    const modeButtons = document.querySelectorAll('.tool[data-mode]');

    function setMode(mode) {
        if (board.dataset.mode === mode) return;
        flip(() => {
            board.dataset.mode = mode;
            if (mode === 'scatter') layoutScatter();
            else board.style.height = '';
        });
        modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === mode)));
    }

    function shuffle() {
        for (let i = order.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [order[i], order[j]] = [order[j], order[i]];
        }
        cards.forEach((c) => { c._jit = { x: rand(-1, 1), y: rand(-1, 1), r: rand(-13, 13) }; });
        flip(() => {
            order.forEach((i) => board.appendChild(cards[i]));
            if (board.dataset.mode === 'scatter') layoutScatter();
        });
        foodConfetti({ particleCount: 24, origin: { x: 0.5, y: 0.35 } });
    }

    modeButtons.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));
    document.querySelector('.tool[data-action="shuffle"]').addEventListener('click', shuffle);

    /* ---------- Kéo thả ảnh (chuột) & bấm để xem to ---------- */
    let zTop = cards.length + 1;

    cards.forEach((card) => {
        let drag = null;

        card.addEventListener('pointerdown', (e) => {
            if (board.dataset.mode !== 'scatter' || e.pointerType === 'touch' || e.button !== 0) return;
            drag = { x: e.clientX, y: e.clientY, left: card.offsetLeft, top: card.offsetTop, moved: false };
            card.setPointerCapture(e.pointerId);
            if (zTop > 700) zTop = cards.length + 1;
            card.style.zIndex = ++zTop;
        });

        card.addEventListener('pointermove', (e) => {
            if (!drag) return;
            const dx = e.clientX - drag.x;
            const dy = e.clientY - drag.y;
            if (!drag.moved && Math.hypot(dx, dy) < 6) return;
            drag.moved = true;
            card.classList.add('is-dragging');
            const maxX = board.clientWidth - card.offsetWidth;
            card.style.left = Math.max(-20, Math.min(maxX + 20, drag.left + dx)) + 'px';
            card.style.top = Math.max(-20, drag.top + dy) + 'px';
        });

        const endDrag = () => {
            if (!drag) return;
            if (drag.moved) {
                card.dataset.dragged = '1';
                card._jit.r = rand(-10, 10);
                card.style.setProperty('--r', card._jit.r.toFixed(1) + 'deg');
                // Kéo xuống thấp thì bảng tự dài thêm
                const bottom = card.offsetTop + card.offsetHeight + 60;
                if (bottom > board.offsetHeight) board.style.height = bottom + 'px';
            }
            card.classList.remove('is-dragging');
            drag = null;
        };
        card.addEventListener('pointerup', endDrag);
        card.addEventListener('pointercancel', endDrag);

        card.addEventListener('click', () => {
            if (card.dataset.dragged) {
                card.dataset.dragged = '';
                return;
            }
            openLightbox(Number(card.dataset.index));
        });

        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(Number(card.dataset.index));
            }
        });
    });

    // Bấm vào chỗ trống trên bảng → đồ ăn bắn ra
    board.addEventListener('pointerdown', (e) => {
        if (e.target !== board) return;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 45 + Math.random() * 35;
            const el = document.createElement('span');
            el.className = 'cursor-pop';
            el.textContent = pick(FOODS);
            el.style.left = e.clientX + 'px';
            el.style.top = e.clientY + 'px';
            el.style.fontSize = 18 + Math.random() * 10 + 'px';
            el.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            el.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            el.style.setProperty('--rot', rand(-90, 90) + 'deg');
            el.addEventListener('animationend', () => el.remove());
            document.body.appendChild(el);
        }
    });

    /* ---------- Xem ảnh to ---------- */
    const lb = document.querySelector('.lightbox');
    const lbPhoto = lb.querySelector('.lb-photo');
    const lbCaption = lb.querySelector('.lb-caption');
    const lbCount = lb.querySelector('.lb-count');
    let current = 0;
    let lastFocus = null;

    function renderLightbox(i, dir) {
        current = (i + items.length) % items.length;
        fillPhoto(lbPhoto, items[current], current, true); // xem to → ảnh lớn
        lbCaption.textContent = items[current].caption || `Kỷ niệm #${current + 1}`;
        lbCount.textContent = `${current + 1} / ${items.length}`;
        if (dir) {
            lbPhoto.classList.remove('slide-l', 'slide-r');
            void lbPhoto.offsetWidth;
            lbPhoto.classList.add(dir > 0 ? 'slide-r' : 'slide-l');
        }
    }

    function openLightbox(i) {
        lastFocus = document.activeElement;
        renderLightbox(i);
        lb.hidden = false;
        document.body.classList.add('lb-open', 'nav-locked');
        lb.querySelector('.lb-close').focus();
        foodConfetti({ particleCount: 16, origin: { x: 0.5, y: 0.45 } });
    }

    function closeLightbox() {
        lb.hidden = true;
        document.body.classList.remove('lb-open', 'nav-locked');
        if (lastFocus) lastFocus.focus();
    }

    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-prev').addEventListener('click', () => renderLightbox(current - 1, -1));
    lb.querySelector('.lb-next').addEventListener('click', () => renderLightbox(current + 1, 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });

    addEventListener('keydown', (e) => {
        if (lb.hidden) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') renderLightbox(current - 1, -1);
        else if (e.key === 'ArrowRight') renderLightbox(current + 1, 1);
        else return;
        e.preventDefault();
    });

    // Vuốt trái / phải trên điện thoại
    let swipeX = null;
    lbPhoto.addEventListener('pointerdown', (e) => { swipeX = e.clientX; });
    lbPhoto.addEventListener('pointerup', (e) => {
        if (swipeX === null) return;
        const dx = e.clientX - swipeX;
        swipeX = null;
        if (Math.abs(dx) > 50) renderLightbox(current + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    });

    /* ---------- Pháo giấy hình đồ ăn ---------- */
    const hasConfetti = typeof window.confetti === 'function' && confetti.shapeFromText && !reduceMotion;
    const foodShapes = hasConfetti
        ? ['🍰', '🍩', '🍓', '🧋', '🍡', '🍪', '🧁', '🍭'].map((text) => confetti.shapeFromText({ text, scalar: 2.2 }))
        : [];

    function foodConfetti(opts = {}) {
        if (!hasConfetti) return;
        confetti(Object.assign({
            shapes: foodShapes,
            scalar: 2.2,
            particleCount: 30,
            spread: 100,
            startVelocity: 35,
            gravity: 0.9,
            ticks: 220,
            flat: true,
            zIndex: 9600,
            origin: { x: 0.5, y: 0.5 }
        }, opts));
    }

    /* ---------- Mưa đồ ăn ---------- */
    const rain = document.querySelector('.food-rain');

    function dropFood(prewarm) {
        // Càng nhiều món rơi cùng lúc thì trình duyệt càng phải ghép nhiều lớp mỗi khung hình
        if (document.hidden || document.body.classList.contains('lb-open')) return;
        if (rain.childElementCount > (window.innerWidth < 640 ? 6 : 12)) return;
        const el = document.createElement('span');
        el.className = 'food-drop';
        el.textContent = pick(FOODS);
        const duration = rand(10, 17);
        el.style.setProperty('--x', rand(0, 97) + 'vw');
        el.style.setProperty('--s', rand(18, 34) + 'px');
        el.style.setProperty('--d', duration + 's');
        el.style.setProperty('--sway', rand(-60, 60) + 'px');
        el.style.setProperty('--rot', rand(-360, 360) + 'deg');
        if (prewarm) el.style.animationDelay = -rand(0, duration) + 's';
        el.addEventListener('animationend', () => el.remove());
        rain.appendChild(el);
    }

    /* ---------- Băng chuyền ---------- */
    const belt = FOODS.slice(0, 16);
    document.querySelector('.conveyor__track').innerHTML =
        [...belt, ...belt].map((f) => `<span class="plate"><i>${f}</i></span>`).join('');

    // Cuộn qua khỏi băng chuyền thì cho nó nghỉ (đỡ tốn một lớp chạy hoài ở nền)
    const conveyor = document.querySelector('.conveyor');
    if (conveyor && 'IntersectionObserver' in window) {
        new IntersectionObserver(
            ([entry]) => conveyor.classList.toggle('is-idle', !entry.isIntersecting),
            { rootMargin: '120px 0px' }
        ).observe(conveyor);
    }

    /* ---------- Video ---------- */
    const videoSection = document.querySelector('.video-moment');
    const videoList = videoSection.querySelector('.video-list');
    const isPreview = (() => { try { return sessionStorage.getItem('qb-preview') === '1'; } catch (e) { return false; } })();
    // Nhạc nền của trang chủ (shell.js giữ trình phát ở trang chủ)
    const hostMusic = (() => { try { return window.top.QBMusic || null; } catch (e) { return null; } })();

    if (VIDEOS.length) {
        VIDEOS.forEach((v, i) => {
            const card = document.createElement('figure');
            card.className = 'video-card';
            card.style.setProperty('--tilt', (i % 2 ? 1.2 : -1.2) + 'deg');
            const frame = document.createElement('div');
            frame.className = 'video-frame';
            const video = document.createElement('video');
            video.controls = true;
            video.playsInline = true;
            video.setAttribute('playsinline', '');         // iPhone: phát ngay trong trang
            video.setAttribute('webkit-playsinline', '');   // iOS đời cũ
            video.setAttribute('controlsList', 'nodownload');
            video.preload = 'none'; // Đổi thành none để không tải trước video, giảm lag
            if (v.poster) video.poster = v.poster; // ảnh bìa hiện ngay, chưa cần tải video
            video.src = v.src;
            // Xem video → nhạc nền tạm dừng; xem xong / dừng → nhạc phát tiếp
            video.addEventListener('play', () => {
                videoList.querySelectorAll('video').forEach((o) => { if (o !== video) o.pause(); });
                if (hostMusic && hostMusic.hold) hostMusic.hold();
            });
            const resume = () => {
                const anyPlaying = [...videoList.querySelectorAll('video')].some((o) => !o.paused && !o.ended);
                if (!anyPlaying && hostMusic && hostMusic.release) hostMusic.release();
            };
            video.addEventListener('pause', resume);
            video.addEventListener('ended', resume);
            frame.appendChild(video);
            card.appendChild(frame);
            if (v.caption) {
                const cap = document.createElement('figcaption');
                cap.textContent = v.caption;
                card.appendChild(cap);
            }
            videoList.appendChild(card);
        });
        videoSection.hidden = false;
    } else if (isPreview) {
        // Chỉ hiện ở chế độ xem trước: chỉ chỗ để bạn bỏ video vào
        videoList.innerHTML =
            '<div class="video-empty"><span class="video-empty__icon">🎬</span>' +
            '<b>Chỗ này dành cho video của bạn</b>' +
            '<span>Bỏ file <code>.mp4</code> vào thư mục <code>album/videos/</code> rồi khai báo trong mảng <code>VIDEOS</code> ở đầu <code>album.js</code>.</span>' +
            '<small>Khung này chỉ hiện ở chế độ xem trước, Quỳnh sẽ không thấy.</small></div>';
        videoSection.hidden = false;
    }

    /* ---------- Khởi động ---------- */
    // Điện thoại: mặc định "Xếp gọn" cho dễ xem (46 ảnh rải trên màn hình hẹp sẽ chồng lên nhau)
    if (matchMedia('(max-width: 640px)').matches) {
        board.dataset.mode = 'grid';
        modeButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === 'grid')));
    } else {
        layoutScatter();
    }
    pumpLazy();
    dealIn();
    if (!reduceMotion) {
        // Trên điện thoại giảm lượng mưa đồ ăn xuống để đỡ lag
        const isMobile = window.innerWidth < 640;
        const dropCount = isMobile ? 4 : 8;
        const dropInterval = isMobile ? 1800 : 1100;

        for (let i = 0; i < dropCount; i++) dropFood(true);
        setInterval(dropFood, dropInterval);
        setTimeout(() => {
            foodConfetti({ angle: 60, origin: { x: 0, y: 0.7 } });
            foodConfetti({ angle: 120, origin: { x: 1, y: 0.7 } });
        }, 900);
    }

    // Tính lại khi font tải xong (chiều cao ảnh đổi) và khi đổi bề ngang màn hình
    if (document.fonts) document.fonts.ready.then(() => { if (board.dataset.mode === 'scatter') layoutScatter(); });
    let lastWidth = board.clientWidth;
    let resizeTimer = null;
    addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (board.clientWidth === lastWidth) return;
            lastWidth = board.clientWidth;
            if (board.dataset.mode === 'scatter') layoutScatter();
        }, 200);
    });
})();
