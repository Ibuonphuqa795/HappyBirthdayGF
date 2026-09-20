// Màn hình khoá: đếm ngược tới sinh nhật → câu hỏi bí mật → mở quà
// Nạp trong <head> của mọi trang (trước các script khác).
(() => {
    /* =======================================================
       🔛 CÔNG TẮC
       - COUNTDOWN_ON: true  = khoá & đếm ngược tới ngày sinh nhật
                       false = tạm tắt đếm ngược (vào thẳng câu hỏi) — dùng khi đang sửa web
       - QUESTION_ON:  true  = hỏi câu hỏi bí mật trước khi mở quà
                       false = bỏ qua câu hỏi
       (Tắt cả hai → không còn màn khoá nào, vào thẳng hộp quà)
       ⚠️ Nhớ bật COUNTDOWN_ON = true lại trước khi gửi link cho Quỳnh nha!
       ======================================================= */
    const COUNTDOWN_ON = true;
    const QUESTION_ON = true;

    /* =======================================================
       ⚙️ CÀI ĐẶT — sửa ở đây
       - BIRTHDAY: thời điểm mở khoá (giờ Việt Nam, +07:00)
       - QUESTION / ANSWERS: câu hỏi bí mật và các đáp án được chấp nhận
         (không phân biệt hoa thường, dấu, khoảng trắng hay dấu câu)
       - Muốn xem thử trước ngày sinh nhật: mở  index.html?xem-truoc
         Máy này sẽ nhớ luôn, mở tab mới hay tắt trình duyệt vào lại vẫn xem được.
       - Muốn xem lại đúng thứ Quỳnh sẽ thấy: mở  index.html?khoa-lai
         (hoặc mở cửa sổ ẩn danh)
       - Ngay dưới đồng hồ đếm ngược cũng có nút "Lối tắt cho chủ nhân món quà":
         nhập mật khẩu (chính là ANSWERS bên dưới — ngày sinh nhật) là xem trước được.
       ======================================================= */
    const BIRTHDAY = '2026-09-21T00:00:00+07:00';
    const QUESTION = 'Sinh nhật của em là ngày nào nè? 🎂';
    const ANSWERS = ['21/9', '21/09', '21 tháng 9', 'ngày 21 tháng 9', '21-9', '21.9'];
    const HINT = 'Gợi ý: là ngày hôm nay đó 🥰 (nhập kiểu ngày/tháng nha)';

    const UNLOCK_KEY = 'qb-unlocked';
    const PREVIEW_KEY = 'qb-preview';

    const safe = (fn, fallback) => { try { return fn(); } catch (e) { return fallback; } };
    const params = new URLSearchParams(location.search);

    // Nhớ vào localStorage chứ không phải sessionStorage: sessionStorage mất sạch khi
    // đóng tab, nên mỗi lần mở lại web để sửa là lại bị màn khoá chặn.
    if (params.has('xem-truoc')) {
        safe(() => localStorage.setItem(PREVIEW_KEY, '1'));
        safe(() => sessionStorage.removeItem(PREVIEW_KEY));
    }
    // Tắt chế độ xem trước để kiểm tra lại đúng thứ người nhận sẽ thấy
    if (params.has('khoa-lai')) {
        safe(() => localStorage.removeItem(PREVIEW_KEY));
        safe(() => sessionStorage.removeItem(PREVIEW_KEY));
        safe(() => localStorage.removeItem(UNLOCK_KEY));
    }

    const preview = safe(() => localStorage.getItem(PREVIEW_KEY) === '1', false)
        || safe(() => sessionStorage.getItem(PREVIEW_KEY) === '1', false);
    const unlocked = safe(() => localStorage.getItem(UNLOCK_KEY) === '1', false);

    const target = new Date(BIRTHDAY).getTime();
    const waiting = COUNTDOWN_ON && Date.now() < target;
    const conKhoa = waiting || QUESTION_ON; // nếu không xem trước thì màn khoá sẽ chặn

    const page = location.pathname.split('/').pop() || 'index.html';
    const isHome = page === 'index.html' || page === '';

    /* Đang bật xem trước mà màn khoá lẽ ra vẫn chặn → hiện một cái huy hiệu nhỏ để
       biết ngay là mình đang đi cửa sau, bấm một cái là khoá lại. Không có nó thì vào
       trang thấy mở toang, dễ tưởng đếm ngược bị hỏng. */
    function hienHuyHieuXemTruoc() {
        const dung = () => {
            if (document.querySelector('.preview-badge')) return;
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'preview-badge';
            b.innerHTML = '👀 Đang xem trước <b>· Khoá lại</b>';
            b.title = 'Bạn đang bỏ qua màn đếm ngược. Bấm để khoá lại và xem đúng thứ Quỳnh sẽ thấy.';
            b.addEventListener('click', () => {
                safe(() => localStorage.removeItem(PREVIEW_KEY));
                safe(() => sessionStorage.removeItem(PREVIEW_KEY));
                safe(() => localStorage.removeItem(UNLOCK_KEY));
                location.replace(location.pathname);
            });
            document.body.appendChild(b);
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', dung);
        else dung();
    }

    if (preview) {
        if (conKhoa && isHome) hienHuyHieuXemTruoc();
        return;
    }
    if (unlocked) return;
    if (!conKhoa) return; // không có màn khoá nào cần hiện

    // Trang khác mà chưa mở khoá → quay về trang đầu
    if (!isHome) {
        location.replace('index.html');
        return;
    }

    // Ẩn hộp quà ngay từ đầu để không bị lộ trước khi màn khoá hiện
    document.documentElement.classList.add('gate-locked');

    const normalize = (s) => s.toLowerCase().normalize('NFD')
        .replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]/g, '');
    const accepted = new Set(ANSWERS.map(normalize));
    const pad = (n) => String(n).padStart(2, '0');

    /* ---------- Chấm đáp án kiểu "dễ tính" ----------
       Trước đây chỉ khớp đúng y hệt danh sách ANSWERS nên gõ mỗi "21" là bị báo sai,
       kẹt luôn ở màn khoá. Giờ đọc ngày từ các cụm số trong câu trả lời:
         21 · 21/9 · 21-09 · 21.9.2026 · 9/21 · 219 · 2109 · "ngày 21 tháng 9" · "hai mươi mốt"
       đều được chấp nhận. */
    const NGAY = 21, THANG = 9;

    function dapAnDung(raw) {
        const text = String(raw || '');
        const goc = normalize(text);
        if (!goc) return false;
        if (accepted.has(goc)) return true;

        // "hai muoi mot thang chin" / "ngay 21 thang chin"
        if (/haimuoimot|21/.test(goc) && /(thang)?(chin|9)/.test(goc)) return true;

        const cum = text.match(/\d+/g) || [];
        if (!cum.length) return false;

        // Bỏ năm (4 chữ số) — 21/9/2026, 21.9.2005…
        const ngan = cum.filter((g) => g.length <= 2).map(Number);

        if (ngan.length >= 2) {
            const [a, b] = ngan;
            // chấp nhận cả ngày/tháng lẫn tháng/ngày cho chắc
            return (a === NGAY && b === THANG) || (a === THANG && b === NGAY);
        }
        if (ngan.length === 1) return ngan[0] === NGAY;   // chỉ gõ "21"

        // Gõ dính liền, không dấu ngăn: 219 / 2109 / 2192026 / 21092026
        const g = cum[0];
        return g === '219' || g === '2109'
            || /^219\d{4}$/.test(g) || /^2109\d{4}$/.test(g);
    }

    function build() {
        const gate = document.createElement('div');
        gate.className = 'gate';
        gate.setAttribute('role', 'dialog');
        gate.setAttribute('aria-modal', 'true');
        gate.innerHTML = `
            <div class="gate-card">
                <div class="gate-view gate-view--countdown" hidden>
                    <div class="gate-emoji" aria-hidden="true">🎁<span class="gate-zzz">💤</span></div>
                    <h2>Quà đang được gói nè…</h2>
                    <p class="gate-sub">Còn một xíu nữa là đến sinh nhật Quỳnh Bếuu rồi!</p>
                    <div class="gate-timer" aria-live="polite">
                        <div class="tick"><b data-unit="d">00</b><span>ngày</span></div>
                        <div class="tick"><b data-unit="h">00</b><span>giờ</span></div>
                        <div class="tick"><b data-unit="m">00</b><span>phút</span></div>
                        <div class="tick"><b data-unit="s">00</b><span>giây</span></div>
                    </div>
                    <p class="gate-note">Đúng 00:00 ngày 21/9 hộp quà sẽ tự mở khoá nha 🔐</p>
                    <button type="button" class="gate-peek-btn">🔑 Lối tắt cho chủ nhân món quà</button>
                    <form class="gate-peek" hidden>
                        <label class="gate-peek__label" for="gate-peek-input">Nhập mật khẩu để xem trước nè:</label>
                        <input id="gate-peek-input" class="gate-input gate-input--sm" type="password" autocomplete="off" placeholder="mật khẩu…">
                        <p class="gate-msg gate-msg--peek" aria-live="polite"></p>
                        <button type="submit" class="candy candy--lav jelly gate-peek__go">Xem trước 👀</button>
                    </form>
                </div>
                <form class="gate-view gate-view--question" hidden>
                    <div class="gate-emoji" aria-hidden="true">🔐</div>
                    <h2>Trả lời đúng mới được mở quà nha!</h2>
                    <label class="gate-q" for="gate-answer">${QUESTION}</label>
                    <input id="gate-answer" class="gate-input" type="text" autocomplete="off" placeholder="Nhập câu trả lời của em…">
                    <p class="gate-msg" aria-live="polite"></p>
                    <button type="submit" class="candy jelly gate-submit">Mở khoá 💗</button>
                </form>
            </div>`;
        document.body.appendChild(gate);
        return gate;
    }

    function init() {
        const gate = build();
        const countdown = gate.querySelector('.gate-view--countdown');
        const question = gate.querySelector('.gate-view--question');
        const input = gate.querySelector('.gate-input');
        const msg = gate.querySelector('.gate-msg');
        const card = gate.querySelector('.gate-card');
        let tries = 0;

        /* ---------- Lối tắt: nhập mật khẩu (chính là ngày sinh nhật) để xem trước ----------
           Dùng chung bộ đáp án với câu hỏi bí mật nên gõ 21/9, 21-9, 21.9… đều được. */
        const peekBtn = gate.querySelector('.gate-peek-btn');
        const peekForm = gate.querySelector('.gate-peek');
        const peekInput = gate.querySelector('#gate-peek-input');
        const peekMsg = gate.querySelector('.gate-msg--peek');
        let peekTries = 0;

        peekBtn.addEventListener('click', () => {
            peekBtn.hidden = true;
            peekForm.hidden = false;
            setTimeout(() => peekInput.focus(), 50);
        });

        peekForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pass = normalize(peekInput.value);
            if (!pass) {
                peekMsg.textContent = 'Nhập mật khẩu đã nha 🥺';
                return;
            }
            if (dapAnDung(peekInput.value)) {
                // Nhớ lại máy này, lần sau vào thẳng khỏi phải nhập nữa
                safe(() => localStorage.setItem(PREVIEW_KEY, '1'));
                peekMsg.textContent = 'Đúng rồi, vào xem thôi 🎉';
                gate.classList.add('gate--open');
                document.documentElement.classList.remove('gate-locked');
                setTimeout(() => gate.remove(), 700);
                return;
            }
            peekTries++;
            peekMsg.textContent = peekTries >= 3
                ? 'Mật khẩu là 21/9 đó 🎂'
                : (peekTries >= 2 ? 'Gợi ý: là ngày sinh nhật đó, kiểu ngày/tháng 🎂' : 'Sai mật khẩu rồi 🥺');
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
            peekInput.select();
        });

        function celebrate() {
            if (typeof window.confetti !== 'function') return;
            confetti({ particleCount: 140, spread: 110, origin: { y: 0.6 }, zIndex: 10100,
                colors: ['#FF8FB1', '#FFC8D8', '#FFE08A', '#C9B2FF', '#BDF0E0', '#ffffff'] });
        }

        // Mở màn khoá, hiện hộp quà
        function openGate() {
            safe(() => localStorage.setItem(UNLOCK_KEY, '1'));
            gate.classList.add('gate--open');
            document.documentElement.classList.remove('gate-locked');
            setTimeout(() => gate.remove(), 700);
        }

        function showQuestion(withConfetti) {
            countdown.hidden = true;
            question.hidden = false;
            if (withConfetti) celebrate();
            setTimeout(() => input.focus(), 50);
        }

        // Hết giờ đếm ngược → hỏi câu hỏi (nếu bật), không thì mở quà luôn
        function countdownDone() {
            if (QUESTION_ON) {
                showQuestion(true);
            } else {
                celebrate();
                openGate();
            }
        }

        if (waiting) {
            countdown.hidden = false;
            const units = {};
            countdown.querySelectorAll('[data-unit]').forEach((el) => { units[el.dataset.unit] = el; });
            const tick = () => {
                const left = target - Date.now();
                if (left <= 0) {
                    clearInterval(timer);
                    countdownDone();
                    return;
                }
                const s = Math.floor(left / 1000);
                units.d.textContent = pad(Math.floor(s / 86400));
                units.h.textContent = pad(Math.floor(s / 3600) % 24);
                units.m.textContent = pad(Math.floor(s / 60) % 60);
                const sec = pad(s % 60);
                if (units.s.textContent !== sec) {
                    units.s.textContent = sec;
                    units.s.parentElement.classList.remove('bump');
                    void units.s.offsetWidth;
                    units.s.parentElement.classList.add('bump');
                }
            };
            const timer = setInterval(tick, 250);
            tick();
        } else {
            showQuestion(false);
        }

        question.addEventListener('submit', (e) => {
            e.preventDefault();
            const answer = normalize(input.value);
            if (!answer) {
                msg.textContent = 'Em nhập câu trả lời đã nha 🥺';
                return;
            }
            if (dapAnDung(input.value)) {
                msg.textContent = 'Đúng rồi! Mở quà thôi nào 🎉';
                openGate();
                return;
            }
            tries++;
            msg.textContent = tries >= 3
                ? 'Gõ giúp anh: 21/9 nha 💗'
                : (tries >= 2 ? HINT : 'Hông đúng rồi, thử lại xem nè 🥺');
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
            input.select();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
