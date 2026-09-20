// "Vỏ" giữ trang chủ luôn sống để nhạc phát liền mạch:
// các trang con (lời chúc, kỷ niệm, album, cây ước nguyện) được mở trong một khung
// phủ kín màn hình ngay trên trang chủ, thay vì tải lại cả trang.
// Nạp trong <head> của mọi trang, ngay sau gate.js.
(() => {
    const fileOf = (path) => path.split('/').pop() || 'index.html';
    const current = fileOf(location.pathname);
    const isHome = current === 'index.html';

    let framed = false;
    try { framed = window.top !== window && Boolean(window.top.QBShell); } catch (e) { framed = false; }

    // Trang chủ bị mở bên trong khung (vd: nút "Quay Lại Từ Đầu") → đóng khung, về trang chủ thật
    if (framed) {
        if (isHome) window.top.QBShell.home();
        return;
    }

    // Trang con mở trực tiếp (gõ link / tải lại) → chuyển về trang chủ và mở trang đó trong khung
    if (!isHome) {
        location.replace('index.html' + location.search + '#p=' + encodeURIComponent(current));
        return;
    }

    /* ---------- Trang chủ: quản lý khung ---------- */
    // Chỉ những trang này mới được mở trong khung / ghi lên thanh địa chỉ
    const PAGES = ['cause.html', 'last.html', 'album.html', 'tree.html'];
    const homeTitle = document.title;
    let frame = null;

    function showFrame() {
        const body = document.body;
        body.classList.remove('page-leaving');
        body.style.opacity = '1'; // script.js làm mờ body trước khi chuyển trang
        body.classList.add('shell-framed');
    }

    function onFrameLoad() {
        if (!frame) return;
        let win;
        try { win = frame.contentWindow; } catch (e) { return; }
        if (!win || win.location.protocol === 'about:') return; // trang trống tạm thời của khung → bỏ qua
        const file = fileOf(win.location.pathname);
        if (file === 'index.html') return; // shell.js bên trong khung sẽ gọi home()
        if (!PAGES.includes(file)) return;  // trang lạ → không ghi lên thanh địa chỉ
        history.replaceState(null, '', location.pathname + location.search + '#p=' + encodeURIComponent(file));
        document.title = win.document.title || homeTitle;
        // Đánh dấu trang con đang mở để trang chủ tự chỉnh mấy thứ nổi bên trên khung
        // (vd: huy hiệu "đang xem trước" phải né thanh điều hướng của từng trang)
        document.body.dataset.page = file;
    }

    function go(file) {
        const target = fileOf(String(file).split('#')[0]);
        // Trang chủ hoặc tên trang lạ (vd: "blank") → về trang chủ, không bao giờ báo lỗi
        if (!PAGES.includes(target)) {
            home();
            return;
        }
        showFrame();
        if (!frame) {
            frame = document.createElement('iframe');
            frame.className = 'page-frame';
            frame.title = 'Trang quà sinh nhật';
            frame.setAttribute('allow', 'autoplay; fullscreen');
            frame.src = target; // gán địa chỉ TRƯỚC khi gắn vào trang → không có trang trống tạm thời
            frame.addEventListener('load', onFrameLoad);
            document.body.appendChild(frame);
        } else {
            frame.src = target;
        }
        frame.focus();
    }

    function home() {
        if (frame) {
            frame.remove();
            frame = null;
        }
        delete document.body.dataset.page;
        const body = document.body;
        body.classList.remove('shell-framed', 'page-leaving');
        body.style.opacity = '1';
        history.replaceState(null, '', location.pathname + location.search);
        document.title = homeTitle;
    }

    window.QBShell = { go, home, isFramed: () => Boolean(frame) };

    // Tải lại trình duyệt khi đang ở trang con → mở lại đúng trang đó
    const restore = () => {
        const match = location.hash.match(/^#p=(.+)$/);
        if (!match) return;
        const target = decodeURIComponent(match[1]);
        if (!PAGES.includes(target)) {
            home(); // xoá địa chỉ hỏng (vd: #p=blank) và ở lại trang chủ
            return;
        }
        if (document.documentElement.classList.contains('gate-locked')) return; // chưa mở khoá
        if (window.QBMusic) window.QBMusic.resume();
        go(target);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(restore, 0));
    else setTimeout(restore, 0);
})();
