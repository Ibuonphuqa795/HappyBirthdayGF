// Tiếng gõ phím khi chữ hiện ra — phát khi đang gõ, dừng ngay khi hết chữ
(() => {
    /* =======================================================
       ⌨️ NGUỒN ÂM THANH (ưu tiên theo thứ tự)
       1. TYPING_SRC: file âm thanh trong dự án (vd: 'sounds/typing.mp3') — khớp nhất
       2. TYPING_YOUTUBE_ID: phát tiếng gõ phím từ video YouTube (trình phát nhúng, ẩn đi)
       ======================================================= */
    const TYPING_SRC = 'sounds/typing.mp3';
    // Đoạn có tiếng gõ trong file (giây). File gốc chỉ gõ từ 0,96s → 7,47s, phần sau im lặng,
    // nên chỉ lặp đúng đoạn này; 2 điểm cắt nằm ở chỗ âm lượng gần 0 → lặp không bị "tách".
    const TYPING_LOOP = [0.899, 7.541];
    const TYPING_YOUTUBE_ID = 'SSVHWYUJP-E'; // dự phòng khi không có TYPING_SRC
    const VOLUME = 0.7;          // 0 → 1
    const IDLE_MUTE_MS = 260;    // chữ ngừng hiện chừng này → tắt tiếng ngay (vẫn chạy ngầm để câu sau có tiếng liền)
    const IDLE_STOP_MS = 1500;   // ngừng lâu chừng này → dừng hẳn

    let player = null;           // { play(), pause() }
    let playing = false;
    let idleTimer = null;
    let stopTimer = null;

    /* ---------- Trình phát: file âm thanh (Web Audio, lặp chính xác từng mẫu âm thanh) ---------- */
    function createFilePlayer(src, loop) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        let ctx = null;
        let gain = null;
        let buffer = null;
        let source = null;
        let loading = null;
        let target = 0; // âm lượng đang hướng tới (0 = tắt tiếng)

        // Tải & giải mã sẵn ngay khi mở trang (chưa phát gì)
        function load() {
            if (loading) return loading;
            ctx = new AC();
            gain = ctx.createGain();
            gain.gain.value = 0;
            gain.connect(ctx.destination);
            loading = fetch(src)
                .then((r) => r.arrayBuffer())
                .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
                .then((decoded) => { buffer = decoded; return true; })
                .catch(() => false);
            return loading;
        }

        function ensureSource() {
            if (source || !buffer) return;
            source = ctx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.loopStart = loop[0];
            source.loopEnd = Math.min(loop[1], buffer.duration);
            source.connect(gain);
            source.start(0, loop[0]);
        }

        function setGain(v) {
            target = v;
            if (!ctx) return;
            gain.gain.cancelScheduledValues(ctx.currentTime);
            gain.gain.setTargetAtTime(v, ctx.currentTime, 0.012); // bật/tắt mềm, không nghe "bụp"
        }

        function start(volume) {
            load().then((ok) => {
                if (!ok) return;
                if (ctx.state === 'suspended') ctx.resume();
                ensureSource();
                setGain(volume);
            });
        }

        load();

        return {
            arm: () => start(0),               // chạy ngầm không tiếng
            play: () => start(VOLUME),         // bật tiếng
            silence: () => setGain(0),         // tắt tiếng nhưng vẫn chạy ngầm
            pause() {
                setGain(0);
                const s = source;
                source = null;
                if (s) setTimeout(() => { try { s.stop(); } catch (e) { /* đã dừng */ } }, 80);
            },
            state: () => (source && ctx && ctx.state === 'running' ? 1 : 2),
            muted: () => target === 0,
            audibleAny: () => Boolean(source && ctx && ctx.state === 'running' && target > 0)
        };
    }

    /* ---------- Trình phát: YouTube (2 trình phát luân phiên → lặp không có khoảng lặng) ---------- */
    // Trình A đang phát; trước khi A hết đoạn, trình B (nạp sẵn ở đầu đoạn) phát tiếp,
    // B phát thật rồi A mới dừng → hai tiếng chồng nhau một chút, không bao giờ hụt tiếng.
    function createYouTubePlayer(videoId) {
        const HANDOVER = 0.6; // giây: bắt đầu chuyền sang trình kia trước khi hết đoạn chừng này
        const decks = [];     // [{ yt, ready, primed }]
        let active = 0;
        let wantPlay = false; // đang cần phát có tiếng
        let armed = false;    // đang chạy ngầm không tiếng, chờ bật tiếng
        let handingOver = false;

        const host = document.createElement('div');
        host.className = 'yt-host';
        host.setAttribute('aria-hidden', 'true');

        const running = () => wantPlay || armed;
        const cur = () => decks[active];
        const other = () => decks[1 - active];
        const allPrimed = () => decks.length === 2 && decks.every((d) => d.primed);

        // Đặt tiếng cho trình đang phát theo trạng thái hiện tại
        function applyVolume(deck) {
            if (wantPlay) deck.yt.unMute();
            else deck.yt.mute();
        }

        function makeDeck() {
            const mountPoint = document.createElement('div');
            host.appendChild(mountPoint);
            const deck = { yt: null, ready: false, primed: false };
            deck.yt = new YT.Player(mountPoint, {
                width: 200,
                height: 200,
                videoId,
                playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
                events: {
                    onReady: () => {
                        deck.ready = true;
                        deck.yt.setVolume(Math.round(VOLUME * 100));
                        // Nạp sẵn: phát không tiếng một nhịp rồi dừng ở đầu đoạn
                        deck.yt.mute();
                        deck.yt.playVideo();
                    },
                    onStateChange: (e) => {
                        if (!deck.primed && e.data === 1) {
                            deck.primed = true;
                            deck.yt.pauseVideo();
                            deck.yt.seekTo(0, true);
                            // Trình chính đã sẵn sàng mà đang có người chờ phát → phát luôn
                            if (deck === cur() && running()) {
                                applyVolume(deck);
                                deck.yt.playVideo();
                            }
                        }
                    }
                }
            });
            decks.push(deck);
        }

        const create = () => {
            makeDeck();
            makeDeck();
        };

        const init = () => {
            document.body.appendChild(host);
            if (window.YT && window.YT.Player) {
                create();
                return;
            }
            // Có thể music.js cũng đang chờ YouTube API → nối tiếp, không ghi đè
            const previous = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (previous) previous();
                create();
            };
            if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
                const script = document.createElement('script');
                script.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(script);
            }
        };
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
        else init();

        // Canh thời điểm chuyền sang trình kia
        setInterval(() => {
            if (!allPrimed() || !running() || handingOver) return;
            const a = cur();
            const duration = a.yt.getDuration ? a.yt.getDuration() : 0;
            if (duration < 1 || a.yt.getCurrentTime() < duration - HANDOVER) return;
            handingOver = true;
            const b = other();
            b.yt.seekTo(0, true);
            applyVolume(b);
            b.yt.playVideo();
            // Đợi B phát thật rồi mới dừng A
            const started = Date.now();
            const wait = setInterval(() => {
                if (b.yt.getPlayerState() === 1 || Date.now() - started > 1500) {
                    clearInterval(wait);
                    a.yt.pauseVideo();
                    a.yt.seekTo(0, true);
                    active = 1 - active;
                    handingOver = false;
                }
            }, 40);
        }, 80);

        function startActive() {
            const d = cur();
            if (!d || !d.primed) return; // chưa nạp xong → onStateChange sẽ tự phát khi xong
            applyVolume(d);
            if (d.yt.getPlayerState() !== 1) d.yt.playVideo();
        }

        return {
            // Chạy sẵn không tiếng (gọi trước khi chữ bắt đầu hiện) → lúc cần chỉ việc bật tiếng
            arm() {
                armed = true;
                startActive();
            },
            play() {
                wantPlay = true;
                startActive();
                if (handingOver && other()) other().yt.unMute();
            },
            // Tắt tiếng tức thì nhưng vẫn chạy ngầm → chữ hiện lại là có tiếng liền
            silence() {
                wantPlay = false;
                armed = true;
                decks.forEach((d) => d.ready && d.yt.mute());
            },
            pause() {
                wantPlay = false;
                armed = false;
                handingOver = false;
                decks.forEach((d) => {
                    if (!d.ready) return;
                    d.yt.pauseVideo();
                    d.yt.mute();
                });
            },
            // Trạng thái trình đang phát: 1 = đang phát, 2 = tạm dừng
            state: () => (cur() && cur().ready ? cur().yt.getPlayerState() : null),
            muted: () => (cur() && cur().ready ? cur().yt.isMuted() : null),
            // Có ít nhất một trình đang phát có tiếng (dùng khi kiểm tra)
            audibleAny: () => decks.some((d) => d.ready && d.yt.getPlayerState() === 1 && !d.yt.isMuted())
        };
    }

    player = TYPING_SRC ? createFilePlayer(TYPING_SRC, TYPING_LOOP)
        : TYPING_YOUTUBE_ID ? createYouTubePlayer(TYPING_YOUTUBE_ID)
        : null;

    // Dừng hẳn (hết chữ)
    function stop() {
        clearTimeout(idleTimer);
        clearTimeout(stopTimer);
        playing = false;
        if (player) player.pause();
    }

    // Chữ tạm ngừng → tắt tiếng ngay
    function silence() {
        playing = false;
        if (player) player.silence();
        clearTimeout(stopTimer);
        stopTimer = setTimeout(stop, IDLE_STOP_MS - IDLE_MUTE_MS);
    }

    // "Phiên" gõ liên tục: phát một mạch từ begin() tới end(), bỏ qua mọi quãng nghỉ giữa chừng
    // (dùng cho lá thư: có dấu câu, xuống dòng nhưng tiếng gõ không được ngắt)
    let session = false;
    function begin() {
        if (!player) return;
        session = true;
        clearTimeout(idleTimer);
        clearTimeout(stopTimer);
        playing = true;
        player.play();
    }
    function end() {
        session = false;
        stop();
    }

    // Gọi mỗi khi có một chữ mới hiện ra
    function tick() {
        if (!player || session) return; // đang trong phiên liên tục → cứ để tiếng chạy
        clearTimeout(stopTimer);
        if (!playing) {
            playing = true;
            player.play();
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(silence, IDLE_MUTE_MS);
    }

    // Gọi ngay trước khi chữ bắt đầu hiện (vd: lúc bấm Mở Quà, lúc mở thư)
    function arm() {
        if (player && player.arm) player.arm();
    }

    window.QBTyping = {
        arm, tick, begin, end,
        stop: () => { session = false; stop(); },
        state: () => (player && player.state ? player.state() : null),
        audible: () => Boolean(player && (player.audibleAny ? player.audibleAny() : (player.state && player.state() === 1 && !player.muted())))
    };
    addEventListener('pagehide', stop);
})();
