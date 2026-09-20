# 🎂 Happy Birthday Quỳnh Bếuu 💗

Một trang web sinh nhật nhỏ xinh, phong cách pastel Sanrio, làm riêng tặng Quỳnh Bếuu.
Có mở quà, thổi nến, album kỷ niệm, cây ước nguyện nở hoa và một lá thư bất ngờ ở cuối 🌸

👉 **Xem trang:** https://quynhbeuu.onrender.com

---

## 🗺️ Năm trang

| # | Trang | Có gì bên trong |
|---|---|---|
| 🎁 | `index.html` · **Mở quà** | Màn khoá (đếm ngược + câu hỏi bí mật) → hộp quà → băng rôn *HAPPY BIRTHDAY*, bóng bay, **bánh kem bấm để thổi nến**, pháo giấy, lời chào gõ chữ |
| 💌 | `cause.html` · **Lời chúc** | 4 lời chúc trong những đám mây, rê chuột hiện ảnh động |
| 📸 | `last.html` · **Kỷ niệm** | Ảnh polaroid dán băng keo washi + bức tâm thư trên giấy kẻ dòng |
| 🧺 | `album.html` · **Album** | 6 video + 46 ảnh, xem kiểu rải collage (kéo thả được) hoặc xếp gọn, băng chuyền đồ ăn, mưa đồ ăn |
| 🌳 | `tree.html` · **Cây ước nguyện** | Cây trái tim nở rộ, thư treo lủng lẳng, đèn lồng thả bay, gửi điều ước → quả cầu bay lên cây → **lá thư viết tay** |

Các trang nối với nhau bằng thanh điều hướng tiến/lùi ở góc màn hình.

---

## ⚙️ Vài chỗ có thể chỉnh

| Muốn đổi | Mở file | Sửa chỗ nào |
|---|---|---|
| Bật/tắt màn khoá, đổi câu hỏi bí mật, đổi ngày sinh nhật | `gate.js` | `COUNTDOWN_ON`, `QUESTION_ON`, `BIRTHDAY`, `QUESTION` |
| Nội dung lá thư cuối | `letter.js` | `LETTER` |
| Lời chúc ở trang Lời chúc | `cause.js` | mảng `reasons` ở đầu file |
| Chú thích ảnh / video trong album | `album.js` | `VIDEOS` và `PHOTOS` ở đầu file |
| Nhạc nền | `music.js` | `YOUTUBE_ID` hoặc `MUSIC_SRC` |
| Địa chỉ nhận điều ước | `tree.js` | `access_key` của Web3Forms |

### 🔒 Nhớ làm trước khi gửi link

1. `gate.js`: đặt lại `COUNTDOWN_ON = true` (đang để `false` cho tiện sửa).
2. `gate.js`: đổi câu hỏi bí mật và đáp án.
3. `letter.js`: viết lại nội dung lá thư cho đúng ý mình.
4. Mở thử trên điện thoại ở chế độ ẩn danh (trang có nhớ trạng thái trong `localStorage`).

### 🎵 Nhạc nền trên iPhone/iPad

iOS bắt trình phát YouTube ẩn phải mở toàn màn hình, nên trên iOS trang **không dùng
YouTube** mà chuyển sang nhạc dự phòng. Muốn iPhone cũng nghe đúng bài: chép file mp3
vào dự án rồi điền đường dẫn vào `MUSIC_SRC` trong `music.js` — máy tính vẫn phát qua
YouTube, iPhone sẽ phát file đó.

---

## 🧩 Cách trang được dựng

**Không framework, không bước build.** HTML + CSS + JavaScript thuần, thả lên hosting tĩnh là chạy.
Chỉ mượn 2 thư viện qua CDN: [GSAP](https://gsap.com) (animation ở cây ước nguyện) và
[canvas-confetti](https://github.com/catdad/canvas-confetti) (pháo giấy).

**Nhạc không đứt khi chuyển trang.** `index.html` luôn sống; các trang con mở trong một
khung phủ kín màn hình ngay trên nó (`shell.js`), nên trình phát nhạc không bị tải lại.

**Điều ước gửi bằng [Web3Forms](https://web3forms.com)** (`tree.js`). Mất mạng thì điều ước
được cất vào `localStorage` và tự gửi lại khi có mạng.

---

## 🚀 Chạy thử ở máy

Trang dùng `fetch` và khung iframe cùng nguồn, nên **phải mở qua một web server**,
mở thẳng file `index.html` sẽ lỗi.

```bash
python -m http.server 5500
```

Rồi vào `http://localhost:5500`. Thêm `?xem-truoc` vào sau địa chỉ để bỏ qua màn khoá.

## 📦 Deploy

Render Static Site, trỏ thẳng vào nhánh `main`. Đẩy code lên là tự deploy lại.
Gói miễn phí của Render cho server ngủ khi không ai vào — dùng
[UptimeRobot](https://uptimerobot.com) ping mỗi 5 phút để trang luôn mở được ngay.

---

## 💗 Ghi chú nhỏ

Ảnh và video trong `album/` là kỷ niệm riêng. Bài hát phát qua trình nhúng chính thức
của YouTube, không lưu file nhạc trong repo.

Làm bằng rất nhiều thương ✨
