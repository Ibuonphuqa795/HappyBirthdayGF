// Nhạc nền Happy Birthday + nút bật/tắt trong thanh điều hướng
(() => {
    /* =======================================================
       🎵 CHỌN NHẠC — ưu tiên theo thứ tự:
       1. YOUTUBE_ID: phát trực tiếp từ YouTube (trình phát nhúng chính thức, ẩn đi).
          Lấy ID trong link: youtu.be/<ID> hoặc youtube.com/watch?v=<ID>
       2. MUSIC_SRC: file nhạc trong dự án (vd: 'music/bai-hat.mp3')
       3. Để trống cả hai → trang tự "chơi" giai điệu Happy Birthday kiểu hộp nhạc.
       Nếu YouTube lỗi / bị chặn, trang tự chuyển sang lựa chọn 2 hoặc 3.
       ======================================================= */
    const YOUTUBE_ID = 'h53q6iIORhw';
    const YOUTUBE_TITLE = 'Happy Birthday to You (Always 14) · AMEE x Hoàng Dũng x Obito x Hứa Kim Tuyền';
    const MUSIC_SRC = '';
    const VOLUME = 0.55; // âm lượng (0 → 1)

    const STATE_KEY = 'qb-music';      // 'on' | 'off' — nhớ lựa chọn khi chuyển trang
    const TIME_KEY = 'qb-music-time';  // vị trí bài hát, để tải lại trang vẫn hát tiếp

    /* ---------- Trang con nằm trong khung của trang chủ (shell.js) ----------
       → KHÔNG tạo trình phát mới, chỉ điều khiển trình phát của trang chủ,
         nhờ vậy nhạc chạy liền mạch khi chuyển trang. */
    const hostMusic = (() => {
        try { return window.top !== window ? window.top.QBMusic : null; } catch (e) { return null; }
    })();
    if (hostMusic) {
        mountRemoteButton(hostMusic);
        return;
    }

    function mountRemoteButton(host) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'music-btn';
        const render = (isPlaying) => {
            btn.textContent = isPlaying ? '🎵' : '🔇';
            btn.classList.toggle('is-playing', isPlaying);
            btn.setAttribute('aria-pressed', String(isPlaying));
            const label = isPlaying ? 'Tắt nhạc' : 'Bật nhạc';
            btn.setAttribute('aria-label', label);
            btn.dataset.label = label;
        };
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            host.toggle();
        });
        render(host.isPlaying());
        const unsubscribe = host.subscribe(render);
        addEventListener('pagehide', unsubscribe);
        // Lần bấm trong trang con cũng tính là "người xem đã tương tác" → báo trang chủ
        const relay = (e) => { if (!btn.contains(e.target)) host.gesture(); };
        addEventListener('pointerdown', relay, true);
        addEventListener('keydown', relay, true);

        const mount = () => {
            const nav = document.querySelector('.page-nav');
            if (nav) nav.appendChild(btn);
            else {
                btn.classList.add('music-btn--floating');
                document.body.appendChild(btn);
            }
        };
        if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mount);
        else mount();
    }

    const store = {
        get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } },
        getS: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
        setS: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } }
    };

    /* ---------- Trình phát: file nhạc ---------- */
    function createFilePlayer(src) {
        const audio = new Audio(src);
        audio.loop = true;
        audio.preload = 'auto';
        audio.volume = VOLUME;
        const saved = Number(store.getS(TIME_KEY));
        if (saved) audio.addEventListener('loadedmetadata', () => { audio.currentTime = saved % (audio.duration || Infinity); }, { once: true });
        addEventListener('pagehide', () => store.setS(TIME_KEY, String(audio.currentTime)));
        return {
            play: () => audio.play().then(() => true, () => false),
            pause: () => audio.pause()
        };
    }

    /* ---------- Trình phát: YouTube (IFrame Player API) ---------- */
    function createYouTubePlayer(videoId, onFail) {
        let player = null;
        let failed = false;
        let loading = null;
        const saved = Math.floor(Number(store.getS(TIME_KEY)) || 0);
        const PLAYING = 1;
        const ENDED = 0;
        const stateWaiters = [];

        const fail = () => {
            if (failed) return;
            failed = true;
            stateWaiters.splice(0).forEach((w) => w(false));
            onFail();
        };

        function load() {
            if (loading) return loading;
            loading = new Promise((resolve) => {
                const host = document.createElement('div');
                host.className = 'yt-host';
                host.setAttribute('aria-hidden', 'true');
                const mountPoint = document.createElement('div');
                host.appendChild(mountPoint);
                document.body.appendChild(host);

                const create = () => {
                    player = new YT.Player(mountPoint, {
                        width: 200,
                        height: 200,
                        videoId,
                        playerVars: { autoplay: 0, controls: 0, disablekb: 1, playsinline: 1, rel: 0, start: saved },
                        events: {
                            onReady: () => {
                                player.setVolume(Math.round(VOLUME * 100));
                                resolve(true);
                            },
                            onStateChange: (e) => {
                                if (e.data === ENDED) {
                                    player.seekTo(0, true);
                                    player.playVideo();
                                }
                                if (e.data === PLAYING) stateWaiters.splice(0).forEach((w) => w(true));
                            },
                            onError: () => { resolve(false); fail(); }
                        }
                    });
                };

                if (window.YT && window.YT.Player) {
                    create();
                } else {
                    const previous = window.onYouTubeIframeAPIReady;
                    window.onYouTubeIframeAPIReady = () => {
                        if (previous) previous();
                        create();
                    };
                    const script = document.createElement('script');
                    script.src = 'https://www.youtube.com/iframe_api';
                    script.onerror = () => { resolve(false); fail(); };
                    document.head.appendChild(script);
                }
                // Mạng quá chậm / bị chặn → coi như lỗi
                setTimeout(() => { if (!player) { resolve(false); fail(); } }, 12000);
            });
            return loading;
        }

        addEventListener('pagehide', () => {
            if (player && player.getCurrentTime) store.setS(TIME_KEY, String(player.getCurrentTime()));
        });

        return {
            preload: load,
            play() {
                if (failed) return Promise.resolve(false);
                return load().then((ok) => {
                    if (!ok || failed) return false;
                    if (player.getPlayerState() === PLAYING) return true;
                    return new Promise((resolve) => {
                        stateWaiters.push(resolve);
                        player.unMute();
                        player.playVideo();
                        // Trình duyệt chặn tự phát → đợi lần bấm tiếp theo
                        setTimeout(() => {
                            const i = stateWaiters.indexOf(resolve);
                            if (i >= 0) {
                                stateWaiters.splice(i, 1);
                                resolve(false);
                            }
                        }, 4000);
                    });
                });
            },
            pause() {
                if (player && player.pauseVideo) player.pauseVideo();
            }
        };
    }

    /* ---------- Trình phát: hộp nhạc tự chơi (Web Audio) ---------- */
    function createMusicBox() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        let ctx = null;
        let master = null;
        let scheduler = null;

        const BEAT = 0.52; // giây / phách
        // [nốt MIDI, số phách] — Happy Birthday to You (Đô trưởng, nhịp 3/4)
        const MELODY = [
            [67, .75], [67, .25], [69, 1], [67, 1], [72, 1], [71, 2],
            [67, .75], [67, .25], [69, 1], [67, 1], [74, 1], [72, 2],
            [67, .75], [67, .25], [79, 1], [76, 1], [72, 1], [71, 1], [69, 2],
            [77, .75], [77, .25], [76, 1], [72, 1], [74, 1], [72, 3]
        ];
        // [phách bắt đầu, hợp âm] — bè đệm nhẹ nhàng
        const CHORDS = [
            [1, [48, 64, 67]], [4, [43, 62, 67]], [7, [43, 59, 65]], [10, [48, 64, 67]],
            [13, [48, 64, 70]], [16, [41, 65, 69]], [19, [48, 64, 67]], [22, [43, 62, 65]], [23, [48, 64, 67]]
        ];
        const LOOP_BEATS = 28;

        // Dựng danh sách nốt cho một vòng
        const events = [];
        let beat = 0;
        MELODY.forEach(([note, len]) => {
            events.push({ beat, note, dur: Math.max(1.1, len * BEAT * 1.8), vol: 0.32, bright: true });
            beat += len;
        });
        CHORDS.forEach(([b, notes]) => {
            notes.forEach((note, i) => events.push({
                beat: b + i * 0.08,               // rải nhẹ như gảy đàn
                note,
                dur: i === 0 ? 1.8 : 1.3,
                vol: i === 0 ? 0.16 : 0.07,
                bright: false
            }));
        });
        events.sort((a, b) => a.beat - b.beat);

        const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

        function pluck(e, t) {
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(e.vol, t + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + e.dur);
            gain.connect(master);

            const body = ctx.createOscillator();
            body.type = e.bright ? 'triangle' : 'sine';
            body.frequency.value = freq(e.note);
            body.connect(gain);
            body.start(t);
            body.stop(t + e.dur + 0.05);

            if (e.bright) {
                // Tiếng "leng keng" của hộp nhạc: bồi âm cao, tắt nhanh
                const bell = ctx.createOscillator();
                const bellGain = ctx.createGain();
                bell.type = 'sine';
                bell.frequency.value = freq(e.note) * 4;
                bellGain.gain.setValueAtTime(0.0001, t);
                bellGain.gain.exponentialRampToValueAtTime(e.vol * 0.22, t + 0.005);
                bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
                bell.connect(bellGain).connect(master);
                bell.start(t);
                bell.stop(t + 0.4);
            }
        }

        function setup() {
            ctx = new AC();
            master = ctx.createGain();
            master.gain.value = 0.0001;

            // Tiếng vang lấp lánh
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.26;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.28;
            const wet = ctx.createGain();
            wet.gain.value = 0.22;
            const tone = ctx.createBiquadFilter();
            tone.type = 'lowpass';
            tone.frequency.value = 5200;

            master.connect(tone);
            tone.connect(ctx.destination);
            tone.connect(delay);
            delay.connect(feedback).connect(delay);
            delay.connect(wet).connect(ctx.destination);

            let loopStart = ctx.currentTime + 0.15;
            let index = 0;
            scheduler = setInterval(() => {
                if (ctx.state !== 'running') return;
                const horizon = ctx.currentTime + 0.35;
                while (loopStart + events[index].beat * BEAT < horizon) {
                    pluck(events[index], loopStart + events[index].beat * BEAT);
                    index++;
                    if (index >= events.length) {
                        index = 0;
                        loopStart += LOOP_BEATS * BEAT;
                    }
                }
            }, 90);
        }

        return {
            play() {
                if (!ctx) setup();
                return ctx.resume().then(() => {
                    if (ctx.state !== 'running') return false;
                    master.gain.cancelScheduledValues(ctx.currentTime);
                    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
                    master.gain.exponentialRampToValueAtTime(0.9, ctx.currentTime + 1.2);
                    return true;
                }, () => false);
            },
            pause() {
                if (!ctx) return;
                master.gain.cancelScheduledValues(ctx.currentTime);
                master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
                master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
                setTimeout(() => { if (ctx && !playing) ctx.suspend(); }, 450);
            }
        };
    }

    const createFallback = () => (MUSIC_SRC ? createFilePlayer(MUSIC_SRC) : createMusicBox());
    let player = YOUTUBE_ID
        ? createYouTubePlayer(YOUTUBE_ID, () => {
            // YouTube lỗi → chuyển sang nhạc dự phòng; nếu đang muốn nghe thì phát luôn
            player = createFallback() || player;
            if (playing || wantsMusic()) start();
        })
        : createFallback();
    if (!player) return;
    const isYouTube = () => Boolean(player.preload);

    /* ---------- Nút bật / tắt ---------- */
    let playing = false;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'music-btn';

    const listeners = new Set();
    function render() {
        btn.textContent = playing ? '🎵' : '🔇';
        btn.classList.toggle('is-playing', playing);
        btn.setAttribute('aria-pressed', String(playing));
        const label = playing ? 'Tắt nhạc' : 'Bật nhạc';
        btn.setAttribute('aria-label', label);
        btn.dataset.label = label;
        listeners.forEach((fn) => { try { fn(playing); } catch (e) { listeners.delete(fn); } });
    }

    let announced = store.getS('qb-music-announced') === '1';
    function start() {
        const current = player;
        return current.play().then((ok) => {
            // Trình phát vừa bị đổi sang dự phòng trong lúc chờ → thử lại với trình mới
            if (!ok && player !== current) return start();
            playing = ok;
            if (ok && store.get(STATE_KEY) !== 'off') store.set(STATE_KEY, 'on');
            render();
            if (ok && isYouTube() && !announced) {
                announced = true;
                store.setS('qb-music-announced', '1');
                showNowPlaying();
            }
            return ok;
        });
    }

    // Bong bóng "Đang phát" nhỏ xinh, tự ẩn sau vài giây
    function showNowPlaying() {
        const el = document.createElement('div');
        el.className = 'now-playing';
        el.setAttribute('role', 'status');
        el.innerHTML = '<span class="now-playing__disc">💿</span><span class="now-playing__text"></span>';
        el.querySelector('.now-playing__text').textContent = 'Đang phát: ' + YOUTUBE_TITLE;
        document.body.appendChild(el);
        setTimeout(() => el.classList.add('hide'), 4200);
        setTimeout(() => el.remove(), 5000);
    }

    function stop() {
        playing = false;
        player.pause();
        render();
    }

    function toggle() {
        if (playing) {
            stop();
            store.set(STATE_KEY, 'off');
        } else {
            store.set(STATE_KEY, 'on');
            start();
        }
    }

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggle();
    });

    render();
    const mount = () => {
        const nav = document.querySelector('.page-nav');
        if (nav) nav.appendChild(btn);
        else {
            btn.classList.add('music-btn--floating');
            document.body.appendChild(btn);
        }
    };
    if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mount);
    else mount();

    /* ---------- Khi nào bắt đầu phát ---------- */
    // Nhạc CHỈ bắt đầu từ màn hình Happy Birthday: lúc Quỳnh bấm "Mở Quà".
    // (Bấm ở màn đếm ngược / câu hỏi bí mật sẽ không phát nhạc.)
    // Trình duyệt chỉ cho phát tiếng sau một cú bấm/chạm, nên nếu lần bấm đó chưa phát được
    // (mạng chậm...) thì thử lại ở lần bấm kế tiếp.
    const wantsMusic = () => store.get(STATE_KEY) !== 'off';
    let reachedMain = false; // đã tới màn Happy Birthday chưa
    let heldForVideo = false; // nhạc đang tạm dừng để xem video
    let trying = false;

    function tryStart() {
        if (!reachedMain || !wantsMusic() || playing || trying || heldForVideo) return;
        trying = true;
        start().then(() => { trying = false; });
    }

    // Tải sẵn trình phát YouTube để lúc bấm là nhạc lên ngay
    // (luôn tải sẵn trên trang có nút Mở Quà, vì mở quà là nhạc bật)
    if (isYouTube() && (wantsMusic() || document.querySelector('.open-gift-btn'))) player.preload();

    const giftBtn = document.querySelector('.open-gift-btn');
    if (giftBtn) {
        giftBtn.addEventListener('click', () => {
            // Mở quà → nhạc LUÔN bật (kể cả khi lần trước đã tắt); sau đó tắt hay không là tuỳ người xem
            store.set(STATE_KEY, 'on');
            reachedMain = true;
            tryStart();
        });
    }

    const onGesture = (e) => {
        if (e && e.target && (e.target === btn || btn.contains(e.target))) return;
        tryStart();
    };
    addEventListener('pointerdown', onGesture, true);
    addEventListener('keydown', onGesture, true);

    // Cho các trang con (trong khung) dùng chung trình phát này
    window.QBMusic = {
        toggle,
        isPlaying: () => playing,
        subscribe(fn) {
            listeners.add(fn);
            return () => listeners.delete(fn);
        },
        gesture: onGesture,
        // Tạm dừng nhạc khi xem video (không đổi lựa chọn bật/tắt của người xem)
        hold() {
            if (playing) {
                heldForVideo = true;
                stop();
            }
        },
        // Xem video xong → phát nhạc tiếp nếu trước đó đang phát
        release() {
            if (heldForVideo) {
                heldForVideo = false;
                start();
            }
        },
        // Mở lại trang con sau khi tải lại trình duyệt (Quỳnh đã qua màn Happy Birthday rồi)
        resume() {
            if (store.get(STATE_KEY) === 'on') reachedMain = true;
        }
    };
})();
