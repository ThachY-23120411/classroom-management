# Frontend

Frontend được làm bằng React + Vite. Giao diện gồm các màn đăng nhập, dashboard của instructor, dashboard của student, lesson và chat realtime.

## Công nghệ dùng trong frontend

- React
- Vite
- Axios
- Socket.io Client
- Lucide React

## Cấu trúc chính

```text
frontend/
|-- src/
|   |-- App.jsx
|   |-- App.css
|   `-- main.jsx
|-- index.html
|-- package.json
`-- vite.config.js
```

Hiện tại UI nằm chủ yếu trong `src/App.jsx`, CSS nằm trong `src/App.css`. Vì scope bài challenge không quá lớn nên mình giữ frontend gọn, dễ đọc và dễ sửa.

## Cài đặt

```bash
cd frontend
npm install
```

## Chạy frontend

```bash
npm run dev
```

Sau đó mở:

```text
http://localhost:5173
```

Frontend đang gọi backend ở:

```text
http://localhost:4000
```

Vì vậy trước khi test web thì nên chạy backend trước.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Các màn hình đã làm

- Đăng nhập bằng số điện thoại
- Xác thực mã điện thoại
- Đăng nhập bằng email
- Xác thực mã email
- Instructor quản lý danh sách student
- Thêm, sửa, xóa student
- Instructor giao lesson cho student
- Student xem lesson và đánh dấu hoàn thành
- Instructor chat với student
- Student chat với instructor của mình
- Logout

## Luồng đăng nhập

Instructor đăng nhập bằng số điện thoại. Sau khi nhập số điện thoại, backend tạo mã access code, lưu vào Firebase và thử gửi SMS qua Twilio.

Student có thể đăng nhập bằng email. Backend tạo mã access code, lưu vào Firebase và gửi qua email nếu cấu hình SMTP hợp lệ.

Tài khoản test:

```text
Instructor:
+15550000001
+15550000006
```

```text
Student email:
mia@classroom.local
casey@classroom.local
riley@classroom.local
```

## Ghi chú nghiệp vụ trên giao diện

- Instructor chỉ thấy student thuộc mình.
- Khi instructor thêm student mới, student đó được gắn với instructor đang đăng nhập.
- Student chỉ chat với instructor được gán cho mình.
- Instructor có thể xem từng conversation theo student.
- Lesson hiển thị theo dữ liệu thật trong Firebase, không gán cứng trên giao diện.
- Những label kiểu `Active`, `Online`, `No recent message` đã bỏ nếu không có dữ liệu thật.

## Screenshot

README ngoài cùng đang hiển thị ảnh từ thư mục `screenshots/`:

```text
screenshots/01-phone-login.png
screenshots/02-phone-verification.png
screenshots/03-email-login.png
screenshots/04-email-verification.png
screenshots/05-instructor-students.png
screenshots/06-add-student.png
screenshots/07-instructor-lessons.png
screenshots/08-instructor-chat.png
screenshots/09-student-lessons.png
screenshots/10-student-chat.png
```
