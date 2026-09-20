// Cursor following effect
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Typing effect for greeting
const greetingText = "Quỳnh Bếuu ơi! Em có biết em là cô gái đáng yêu nhất quả đất này không? 💖";
const greetingElement = document.querySelector('.greeting');
let charIndex = 0;

function typeGreeting() {
    if (charIndex < greetingText.length) {
        greetingElement.textContent += greetingText.charAt(charIndex);
        charIndex++;
        setTimeout(typeGreeting, 100);
    }
}

// Create floating elements
const floatingElements = ['💖', '✨', '🌸', '💫', '💕', '🍰', '🍩', '🍫', '🍬', '🍭', '🍓', '🍔', '🍕', '🍡', '🧋', '🎂'];
const TOI_DA_BAY = 16;        // số món bay cùng lúc — giữ đúng mật độ cũ, đỡ nặng máy
const TOC_DO_BAY = [55, 100];  // px mỗi giây, như nhịp bay cũ

function createFloating() {
    // Tab bị ẩn hoặc đang mở trang con trong khung → đừng đẻ thêm cho tốn pin điện thoại
    if (document.hidden || document.body.classList.contains('shell-framed')) return;
    if (document.querySelectorAll('.floating').length >= TOI_DA_BAY) return;

    const element = document.createElement('div');
    element.className = 'floating';
    element.textContent = floatingElements[Math.floor(Math.random() * floatingElements.length)];
    element.style.left = Math.random() * 100 + 'vw';
    element.style.top = Math.random() * 100 + 'vh';
    element.style.fontSize = (Math.random() * 20 + 20) + 'px';
    document.body.appendChild(element);

    /* Quãng đường phải tính từ chỗ món ăn đang đứng, để nó bay vượt hẳn mép trên rồi mới
       biến mất. Trước đây luôn bay đúng 500px: màn hình điện thoại cao hơn 500px nên món
       nào sinh ra ở nửa dưới là tắt ngóm ngay giữa màn hình, lúc đang rõ mồn một.
       Giữ tốc độ cố định (px/giây) nên đường bay vẫn đều như cũ, chỉ dài hơn cho đủ đường. */
    const quangDuong = element.getBoundingClientRect().bottom + 80;
    const tocDo = Math.random() * (TOC_DO_BAY[1] - TOC_DO_BAY[0]) + TOC_DO_BAY[0];

    gsap.to(element, { opacity: 1, duration: 1.5, ease: "none" });
    gsap.to(element, {
        y: -quangDuong,
        x: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        duration: quangDuong / tocDo,
        ease: "none",
        onComplete: () => element.remove()
    });
}

// Handle Gift Open
document.querySelector('.open-gift-btn').addEventListener('click', () => {
    // Hide overlay
    gsap.to('.intro-overlay', {
        y: '-100%', 
        duration: 1.2, 
        ease: "power3.inOut",
        onComplete: () => {
            document.querySelector('.intro-overlay').style.display = 'none';
        }
    });

    // Show container
    document.querySelector('.container').style.display = 'block';

    // Title animation
    gsap.to('h1', {
        opacity: 1,
        duration: 1,
        y: 20,
        ease: "bounce.out",
        delay: 0.5
    });

    // Button animation
    gsap.to('.cta-button', {
        opacity: 1,
        duration: 1,
        y: -20,
        ease: "back.out",
        delay: 1.5
    });

    // Start typing effect
    setTimeout(typeGreeting, 1000);

    // Create floating elements periodically
    setInterval(createFloating, 600); // Faster generation for more cuteness
});

// Hover effects
       // Hover effects
       document.querySelectorAll('.cta-button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            gsap.to(button, {
                scale: 1.1,
                duration: 0.3
            });
        });

        button.addEventListener('mouseleave', () => {
            gsap.to(button, {
                scale: 1,
                duration: 0.3
            });
        });

        // Smooth page transition on click
        button.addEventListener('click', () => {
            gsap.to('body', {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    // Mở trang sau trong khung của trang chủ (shell.js) để nhạc phát liền mạch
                    if (window.QBShell) window.QBShell.go('cause.html');
                    else window.location.href = 'cause.html';
                }
            });
        });
    });