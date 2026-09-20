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
    if (preview || unlocked) return;

    const target = new Date(BIRTHDAY).getTime();
    const waiting = COUNTDOWN_ON && Date.now() < target;
    if (!waiting && !QUESTION_ON) return; // không có màn khoá nào cần hiện

    const page = location.pathname.split('/').pop() || 'index.html';
    const isHome = page === 'index.html' || page === '';

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
            if (accepted.has(answer)) {
                msg.textContent = 'Đúng rồi! Mở quà thôi nào 🎉';
                openGate();
                return;
            }
            tries++;
            msg.textContent = tries >= 2 ? HINT : 'Hông đúng rồi, thử lại xem nè 🥺';
            card.classList.remove('shake');
            void card.offsetWidth;
            card.classList.add('shake');
            input.select();
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
