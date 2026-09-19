// "Ước thêm điều nữa": đóng popup, mở lại hộp điều ước để gửi tiếp (không sửa tree.js)
(() => {
    const btn = document.querySelector('.wish-again-btn');
    const modal = document.querySelector('.modal');
    const wishBox = document.querySelector('.wish-box');
    const wishInput = document.querySelector('.wish-input');
    const wishBtn = document.querySelector('.wish-btn');
    const orb = document.querySelector('.orb');
    if (!btn || !modal || !wishBox) return;

    // Nhớ nội dung popup ban đầu (tree.js có thể đổi chữ khi mạng lỗi)
    const title = modal.querySelector('h2');
    const text = modal.querySelector('p');
    const originalTitle = title.textContent;
    const originalText = text.innerHTML;

    btn.addEventListener('click', () => {
        const reopen = () => {
            modal.style.display = 'none';
            title.textContent = originalTitle;
            text.innerHTML = originalText;
            if (window.gsap && orb) gsap.set(orb, { opacity: 0, scale: 1 });
            wishInput.value = '';
            wishBtn.disabled = false;
            wishBox.style.display = 'flex';
            if (window.gsap) {
                gsap.fromTo(wishBox, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' });
            } else {
                wishBox.style.opacity = '1';
            }
            setTimeout(() => wishInput.focus(), 350);
        };
        if (window.gsap) {
            gsap.to(modal, { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => {
                gsap.set(modal, { clearProps: 'transform,opacity' });
                reopen();
            } });
        } else {
            reopen();
        }
    });
})();
