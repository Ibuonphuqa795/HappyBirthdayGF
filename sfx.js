// Âm thanh khi bấm nút — tạo bằng Web Audio, không cần file âm thanh
(() => {
    const VOLUME = 0.22; // 0 → 1

    // Nút đặc biệt → tiếng "leng keng" lấp lánh; còn lại → tiếng "pop" bong bóng
    const SPARKLE = '.open-gift-btn, .cake, .face-heart, .wish-btn, .gate-submit, .letter-open-btn';
    const CLICKABLE = [
        'button', 'a[href]', '[role="button"]', 'input[type="submit"]',
        '.candy', '.photo', '.reason-card', '.plate', '.page-nav__dot'
    ].join(',');

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    let ctx = null;

    function ensureContext() {
        if (!ctx) ctx = new AC();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    function tone(freqFrom, freqTo, start, dur, type, vol) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freqFrom, start);
        osc.frequency.exponentialRampToValueAtTime(freqTo, start + dur * 0.6);
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(vol, start + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + dur + 0.02);
    }

    // "Pop" bong bóng: nốt vút lên nhanh + một chút tiếng "tách"
    function pop() {
        const t = ctx.currentTime;
        const base = 520 + Math.random() * 180;
        tone(base, base * 2.1, t, 0.12, 'sine', VOLUME);
        tone(base * 3, base * 4, t, 0.04, 'triangle', VOLUME * 0.25);
    }

    // "Leng keng": ba nốt chuông đi lên (Đô – Mi – Sol cao)
    function sparkle() {
        const t = ctx.currentTime;
        [1046.5, 1318.5, 1568].forEach((f, i) => {
            tone(f, f * 1.01, t + i * 0.07, 0.45, 'sine', VOLUME * 0.8);
            tone(f * 2, f * 2.02, t + i * 0.07, 0.2, 'sine', VOLUME * 0.15);
        });
    }

    /* ---------- Tiếng pháo hoa: chỉ có tiếng nổ "bụp" ---------- */
    // Dữ liệu tiếng ồn tạo sẵn MỘT lần rồi dùng lại → tiếng nổ phát ngay, không trễ nhịp
    const noiseCache = {};
    function noiseBuffer(seconds) {
        if (noiseCache[seconds]) return noiseCache[seconds];
        const len = Math.floor(ctx.sampleRate * seconds);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
        noiseCache[seconds] = buf;
        return buf;
    }

    // Pháo bay lên: im lặng, chỉ có tiếng khi nổ
    function launch() {}

    // Pháo nổ: tiếng "bụp" trầm
    function firework(volume = 1) {
        ensureContext();
        const t = ctx.currentTime;
        const v = VOLUME * volume;

        // Bụp
        const boom = ctx.createBufferSource();
        boom.buffer = noiseBuffer(0.5);
        const low = ctx.createBiquadFilter();
        low.type = 'lowpass';
        low.frequency.setValueAtTime(900, t);
        low.frequency.exponentialRampToValueAtTime(120, t + 0.4);
        const boomGain = ctx.createGain();
        boomGain.gain.setValueAtTime(0.0001, t);
        boomGain.gain.exponentialRampToValueAtTime(v * 1.6, t + 0.01);
        boomGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        boom.connect(low).connect(boomGain).connect(ctx.destination);
        boom.start(t);
    }

    // Cho các file khác gọi (celebrate.js)
    window.QBSfx = {
        firework: (volume) => { try { firework(volume); } catch (e) { /* bỏ qua */ } },
        launch: (duration, volume) => { try { launch(duration, volume); } catch (e) { /* bỏ qua */ } },
        // Mở khoá âm thanh sớm (gọi trong lúc người xem bấm) để tiếng pháo không bị trễ
        warmUp: () => { try { ensureContext(); noiseBuffer(0.5); noiseBuffer(0.04); } catch (e) { /* bỏ qua */ } },
        sparkle: () => { try { ensureContext(); sparkle(); } catch (e) { /* bỏ qua */ } }
    };

    function play(target) {
        if (!(target instanceof Element)) return;
        const el = target.closest(CLICKABLE);
        if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
        ensureContext();
        if (el.closest(SPARKLE)) sparkle();
        else pop();
    }

    addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        play(e.target);
    }, { capture: true, passive: true });

    // Bấm bằng bàn phím (Enter / Space) trên nút đang chọn
    addEventListener('keydown', (e) => {
        if (e.repeat || (e.key !== 'Enter' && e.key !== ' ')) return;
        const tag = (e.target.tagName || '').toLowerCase();
        if (tag === 'input' && e.target.type === 'text') return;
        play(e.target);
    }, true);

    // iPhone chỉ "mở khoá" âm thanh sau khi nhấc tay → thử mở lại ở sự kiện click
    addEventListener('click', () => { if (ctx && ctx.state === 'suspended') ctx.resume(); }, true);
})();
