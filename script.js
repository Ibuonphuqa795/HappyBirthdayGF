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
function createFloating() {
    const element = document.createElement('div');
    element.className = 'floating';
    element.textContent = floatingElements[Math.floor(Math.random() * floatingElements.length)];
    element.style.left = Math.random() * 100 + 'vw';
    element.style.top = Math.random() * 100 + 'vh';
    element.style.fontSize = (Math.random() * 20 + 20) + 'px';
    document.body.appendChild(element);

    gsap.to(element, {
        y: -500,
        x: Math.random() * 100 - 50,
        rotation: Math.random() * 360,
        duration: Math.random() * 5 + 5,
        opacity: 1,
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