---
name: sdcorejs-run-guide
description: Generate a plain-language START.md that takes a non-technical user from zero to a running app — install Docker Desktop, one command, which URL to open, default login, common problems. Final step after `sdcorejs-dockerize` + `sdcorejs-auth`. Triggers - "hướng dẫn chạy", "cách chạy", "start guide", "README chạy app", "làm sao để chạy", "run guide", "hướng dẫn khởi động". Applies to angular, nestjs. Bilingual (VI/EN).
allowed-tools: Read, Write
---

# Run Guide — Zero to Running for Non-Tech

## Purpose

Emit a single plain-language `START.md` into the target deploy root that takes a **non-technical** user from a fresh machine to a running app: install Docker Desktop, run **one** command, open the right URL, log in with the demo account, and recover from the handful of problems they're likely to hit. No jargon, numbered steps, describes what they will SEE on screen. This is the **final step** of the Docker build flow — it runs after `sdcorejs-dockerize` has emitted the compose stack and `sdcorejs-auth` has wired the login, so by now `docker compose up` already boots everything (Angular FE at `http://localhost:4200`, Keycloak admin at `http://localhost:8080`, Postgres internal on a volume).

## When invoked / NOT

**Invoked when:**
- The user asks any trigger above ("hướng dẫn chạy", "cách chạy", "start guide", "README chạy app", "làm sao để chạy", "run guide", "hướng dẫn khởi động").
- As the **last step of the Docker build flow** — `sdcorejs-auth` hands off here once the stack is dockerized and login is wired, so the user walks away with a runnable result + the instructions to run it.

**NOT for:**
- There is **no compose stack yet** (`<deploy-root>/docker-compose.yml` absent) — there is nothing to write a run guide *for*. Run **`sdcorejs-dockerize` first** (then `sdcorejs-auth`), then return here. Tell the user what's missing rather than emitting a START.md that points at a command that won't work.

## Step 0 — persona

1. Read the target project's `.sdcorejs/persona.md` (`persona:` field). Absent → `tech`.
2. Load `_refs/shared/persona.md` and apply the matching contract.
3. **Non-tech is the DEFAULT audience for this skill** — the whole point of `START.md` is to onboard someone who does not install or wire tools. Even for a `tech` persona the file stays plain: zero jargon, numbered steps, describe what they will SEE on screen (what the browser shows, what the terminal prints), never internal mechanics. No "reverse proxy", "named volume", "JWT", "realm import" in the user-facing file.
4. **Language follows the session / persona:** emit the **Vietnamese** `START.md` when the session or persona is VI; emit the **English** equivalent (same structure, translated) when EN. The two versions have identical section numbering and content — only the language differs.

## Step 1 — emit START.md

Write the file to the **deploy root** as `<deploy-root>/START.md` (the same directory that holds `docker-compose.yml` — the dir `sdcorejs-dockerize` wrote into). Use Write; this skill WRITES to the target project, never this agent repo.

The Vietnamese `START.md` the skill emits is below. Copy/adapt it verbatim (substitute the real deploy-root name if useful). The **English** version is the *same six numbered sections translated* — keep the structure identical.

```markdown
# Hướng dẫn chạy ứng dụng

Tài liệu này giúp bạn chạy ứng dụng từ đầu, kể cả khi bạn chưa từng dùng lệnh nào.
Làm lần lượt theo các bước dưới đây.

## 1. Cần cài gì

Bạn chỉ cần cài **Docker Desktop** — không cần cài thêm bất cứ thứ gì khác
(không cần cài Node, Java hay cơ sở dữ liệu).

- Tải tại: https://www.docker.com/products/docker-desktop/
- Cài xong, mở Docker Desktop lên và để nó chạy nền (biểu tượng con cá voi ở thanh trạng thái).

## 2. Chạy ứng dụng

1. Mở **Terminal** (hoặc Command Prompt / PowerShell) ngay trong thư mục chứa tài liệu này.
2. Gõ đúng câu lệnh sau rồi nhấn Enter:

   ```
   docker compose up
   ```

3. **Lần chạy đầu tiên** máy sẽ tải về và dựng ứng dụng — việc này mất vài phút, bạn cứ chờ.
   Màn hình sẽ chạy rất nhiều dòng chữ, đó là bình thường.
4. Chờ tới khi thấy dòng báo ứng dụng đã sẵn sàng (không còn dòng mới hiện ra liên tục nữa).

## 3. Mở ứng dụng

1. Mở trình duyệt (Chrome, Edge, Firefox...).
2. Vào địa chỉ: **http://localhost:4200**
3. Đăng nhập thử bằng tài khoản dùng thử:
   - Tên đăng nhập: **demo**
   - Mật khẩu: **demo**

## 4. Trang quản trị tài khoản (tùy chọn)

Phần này chỉ cần khi bạn muốn tạo thêm hoặc chỉnh sửa người dùng — bỏ qua nếu chưa cần.

- Địa chỉ: **http://localhost:8080**
- Đăng nhập quản trị:
  - Tên đăng nhập: **admin**
  - Mật khẩu: **admin**

## 5. Dừng ứng dụng

- Để dừng ứng dụng, quay lại Terminal đang chạy và nhấn **Ctrl + C**, hoặc gõ:

  ```
  docker compose down
  ```

  Dữ liệu của bạn vẫn được giữ lại cho lần chạy sau.

- Nếu muốn **xóa sạch toàn bộ dữ liệu** và bắt đầu lại từ đầu:

  ```
  docker compose down -v
  ```

## 6. Gặp lỗi thường gặp

- **Hiện chữ "port is already allocated"** (cổng đang bị chiếm):
  có một ứng dụng khác đang dùng cổng đó. Cách xử lý: mở file **`.env`** trong thư mục này và đổi
  số cổng sang số khác, hoặc tắt ứng dụng đang chiếm cổng rồi chạy lại.

- **Báo lỗi không kết nối được Docker / Docker chưa chạy:**
  hãy mở **Docker Desktop** lên trước và chờ nó khởi động xong, rồi mới chạy lại lệnh ở Bước 2.

- **Lần đầu chạy rất chậm, hoặc đăng nhập chưa được ngay:**
  trang đăng nhập (Keycloak) cần thêm thời gian để khởi động lần đầu (đang nạp dữ liệu tài khoản).
  Chờ thêm 1–2 phút rồi thử lại.

- **Muốn xem chi tiết một phần đang chạy:**
  gõ `docker compose logs <tên-dịch-vụ>` để xem nhật ký, ví dụ:

  ```
  docker compose logs backend
  ```
```

Notes for the running agent:
- The fenced block above is the literal `START.md` content — write it as the file's body (without the outer ``` fence).
- The **English** `START.md` is the same six sections translated, with identical headings/order: 1. What to install · 2. Run the app · 3. Open the app · 4. Account admin page (optional) · 5. Stop the app · 6. Common problems. Keep `docker compose up` / `down` / `down -v` / `logs <service>`, the URLs (`http://localhost:4200`, `http://localhost:8080`), and the logins (`demo`/`demo`, `admin`/`admin`) exactly as-is in both languages.
- Do NOT invent ports the stack doesn't use — `4200` (app) and `8080` (Keycloak admin) are the published host ports from the dockerize stack; Postgres is internal (no URL). If the deploy root's `.env` defines different `FRONTEND_PORT` / `KEYCLOAK_PORT`, use those numbers instead so the guide matches the real stack.

## Step 2 — confirm to user

After writing the file, tell the user in plain language that the guide is ready and give them the essentials inline so they don't even have to open it:

- **non-tech (VI):** "Mình đã tạo file **START.md** ngay trong thư mục này — đó là hướng dẫn chạy từng bước. Tóm tắt nhanh: cài **Docker Desktop**, mở Terminal trong thư mục này rồi gõ **`docker compose up`**, chờ vài phút, sau đó vào trình duyệt mở **http://localhost:4200** và đăng nhập bằng **demo / demo**."
- **tech (EN):** "Wrote `START.md` to the deploy root. TL;DR: install Docker Desktop → `docker compose up` → open `http://localhost:4200` → log in `demo`/`demo`. Keycloak admin at `http://localhost:8080` (`admin`/`admin`); stop with `docker compose down` (data persists)."

## Important

- This skill **WRITES to the TARGET project** (the deploy root holding `docker-compose.yml`), **NEVER to this agent repo**. Do not create a `START.md` inside this skills repo — the template lives only inside this skill body and is emitted at run time.
- **Idempotent:** overwriting / refreshing an existing `START.md` is fine — re-running the skill simply rewrites the latest guide. There is no user data in `START.md` to preserve (unlike `.env`), so a plain overwrite is safe.
- Keep the file plain-language regardless of persona. The audience for `START.md` is whoever ends up running the app, who may not be the person who built it.
