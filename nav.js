// Thanh điều hướng tiến / lùi giữa 4 trang — độc lập với logic của từng trang
(() => {
    const pages = [
        { file: 'index.html', icon: '🎁', label: 'Mở quà' },
        { file: 'cause.html', icon: '💌', label: 'Lời chúc' },
        { file: 'last.html',  icon: '📸', label: 'Kỷ niệm' },
        { file: 'album.html', icon: '🧺', label: 'Album ảnh' },
        { file: 'tree.html',  icon: '🌳', label: 'Cây ước nguyện' }
    ];

    const currentFile = location.pathname.split('/').pop() || 'index.html';
    let current = pages.findIndex((p) => p.file === currentFile);
    if (current < 0) current = 0;

    // Quay lại trang 1 thì mở quà sẵn luôn, khỏi phải bấm lại
    const hrefOf = (i) => (i === 0 ? 'index.html#mo-qua' : pages[i].file);

    // Có "vỏ" trang chủ (shell.js) → chuyển trang trong khung để nhạc không bị ngắt
    const shell = (() => { try { return window.top.QBShell || null; } catch (e) { return null; } })();

    function go(i) {
        if (i < 0 || i >= pages.length || i === current) return;
        document.body.classList.add('page-leaving');
        setTimeout(() => {
            if (shell) shell.go(pages[i].file);
            else location.href = hrefOf(i);
        }, 420);
    }

    const nav = document.createElement('nav');
    nav.className = 'page-nav';
    nav.setAttribute('aria-label', 'Chuyển trang');

    const makeArrow = (dir) => {
        const target = current + dir;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'page-nav__btn';
        btn.textContent = dir < 0 ? '‹' : '›';
        const label = dir < 0 ? 'Trang trước' : 'Trang sau';
        btn.setAttribute('aria-label', label);
        btn.dataset.label = label;
        btn.disabled = target < 0 || target >= pages.length;
        btn.addEventListener('click', () => go(target));
        return btn;
    };

    const dots = document.createElement('div');
    dots.className = 'page-nav__dots';
    pages.forEach((page, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'page-nav__dot';
        dot.textContent = page.icon;
        dot.dataset.label = page.label;
        dot.setAttribute('aria-label', `${i + 1}. ${page.label}`);
        if (i === current) dot.setAttribute('aria-current', 'page');
        dot.addEventListener('click', () => go(i));
        dots.appendChild(dot);
    });

    nav.append(makeArrow(-1), dots, makeArrow(1));
    document.body.appendChild(nav);

    // Phím mũi tên ← → (bỏ qua khi đang gõ chữ)
    addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        // Trang đang dùng phím mũi tên cho việc khác (vd: xem ảnh to ở album)
        if (document.body.classList.contains('nav-locked')) return;
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
        if (e.key === 'ArrowLeft') go(current - 1);
        if (e.key === 'ArrowRight') go(current + 1);
    });

    // Khi bấm Back của trình duyệt, trang được khôi phục từ cache có thể còn đang mờ → hiện lại
    addEventListener('pageshow', (e) => {
        if (!e.persisted) return;
        document.body.classList.remove('page-leaving');
        document.body.style.opacity = '';
    });
})();
