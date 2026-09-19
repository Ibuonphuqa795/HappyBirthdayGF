const wishBtn = document.querySelector('.wish-btn');
const wishInput = document.querySelector('.wish-input');
const orb = document.querySelector('.orb');
const modal = document.querySelector('.modal');
const wishBox = document.querySelector('.wish-box');

// Create magical fireflies background
function createFireflies() {
    for(let i = 0; i < 40; i++) {
        let firefly = document.createElement('div');
        firefly.className = 'firefly';
        
        // Random size and position
        let size = Math.random() * 4 + 2;
        firefly.style.width = size + 'px';
        firefly.style.height = size + 'px';
        firefly.style.left = Math.random() * window.innerWidth + 'px';
        firefly.style.top = Math.random() * window.innerHeight + 'px';
        
        document.body.appendChild(firefly);

        // Animate firefly
        gsap.to(firefly, {
            x: "random(-100, 100)",
            y: "random(-100, 100)",
            opacity: "random(0.2, 1)",
            duration: "random(2, 6)",
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut"
        });
    }
}

createFireflies();

// ---------- Gửi điều ước qua Web3Forms (có lưu dự phòng) ----------
// Điều ước được lưu vào máy TRƯỚC khi gửi; chỉ xoá khỏi hàng chờ khi Web3Forms
// xác nhận thành công. Gửi lỗi (mất mạng...) thì tự gửi lại khi có mạng / lần sau mở trang.
const PENDING_KEY = 'qb-pending-wishes';

function readPending() {
    try { return JSON.parse(localStorage.getItem(PENDING_KEY)) || []; } catch (e) { return []; }
}

function writePending(list) {
    try { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); } catch (e) { /* bộ nhớ bị chặn */ }
}

function sendWish(wishText) {
    return fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            access_key: "64f70fed-b594-429e-870e-b42433b1ba3b",
            subject: "💌 Bạn có một điều ước mới từ Quỳnh Bếuu!",
            message: "Quỳnh Bếuu vừa ước: " + wishText
        })
    })
        .then(res => res.json().then(data => res.ok && data.success === true))
        .catch(error => {
            console.log("Lỗi gửi email:", error);
            return false;
        });
}

// Gửi 1 điều ước: lưu vào hàng chờ → gửi → xoá khỏi hàng chờ nếu thành công
function deliverWish(wish) {
    const list = readPending();
    if (!list.some(w => w.id === wish.id)) writePending([...list, wish]);
    return sendWish(wish.text).then(ok => {
        if (ok) writePending(readPending().filter(w => w.id !== wish.id));
        return ok;
    });
}

let flushing = false;
function flushPending() {
    if (flushing || !navigator.onLine) return;
    const list = readPending();
    if (!list.length) return;
    flushing = true;
    list.reduce((chain, wish) => chain.then(() => deliverWish(wish)), Promise.resolve())
        .finally(() => { flushing = false; });
}

window.addEventListener('online', flushPending);
flushPending();

// Bong bóng nhắc nhở dễ thương (thay cho alert)
function showToast(message) {
    let toast = document.querySelector('.wish-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'wish-toast';
        toast.setAttribute('role', 'status');
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// Handle Wish Submission
wishBtn.addEventListener('click', () => {
    const wishText = wishInput.value.trim();
    if(!wishText) {
        showToast("Em hãy viết điều ước của mình vào nhé! 🥺");
        wishBox.classList.remove('shake');
        void wishBox.offsetWidth;
        wishBox.classList.add('shake');
        wishInput.focus();
        return;
    }
    wishBtn.disabled = true;

    // Gửi dữ liệu ngầm về email qua Web3Forms (đợi tối đa 8 giây để biết kết quả)
    const wish = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), text: wishText, at: new Date().toISOString() };
    const sendResult = Promise.race([
        deliverWish(wish),
        new Promise(resolve => setTimeout(() => resolve(false), 8000))
    ]);

    // 1. Fade out the wish box
    gsap.to(wishBox, {
        opacity: 0, 
        y: 20, 
        duration: 0.5, 
        onComplete: () => wishBox.style.display = 'none'
    });

    // 2. Set orb starting position (center bottom)
    const boxRect = wishBox.getBoundingClientRect();
    gsap.set(orb, {
        x: window.innerWidth / 2 - 7.5,
        y: boxRect.top + 20,
        opacity: 1,
        scale: 1
    });

    // 3. Animate orb flying up into the tree
    // Target position: approximately the center of the tree
    const targetY = window.innerHeight * 0.4;
    const targetX = window.innerWidth / 2 + (Math.random() * 60 - 30); // slight random x

    gsap.to(orb, {
        x: targetX,
        y: targetY,
        duration: 2.5,
        ease: "power2.inOut",
        onComplete: () => {
            // Orb flash and disappear
            gsap.to(orb, {
                scale: 5,
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    // Chỉ báo "thành công" khi Web3Forms xác nhận; nếu chưa thì báo đã lưu & sẽ tự gửi lại
                    sendResult.then(ok => {
                        if (!ok) {
                            modal.querySelector('h2').textContent = 'Đã Giữ Điều Ước Lại! 💌';
                            modal.querySelector('p').innerHTML =
                                'Mạng đang hơi chập chờn nên điều ước được cất an toàn trong máy em rồi.<br>' +
                                'Có mạng lại là nó tự bay tới anh ngay nha! 💖';
                        }
                        // Show success modal
                        modal.style.display = 'block';
                        gsap.from(modal, {
                            scale: 0.5,
                            opacity: 0,
                            duration: 0.6,
                            ease: "back.out(1.7)"
                        });
                    });
                }
            });
        }
    });
});
