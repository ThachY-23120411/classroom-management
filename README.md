# Classroom Management

Ứng dụng quản lý lớp học gồm backend Express, frontend React và dữ liệu lưu trên Firebase Firestore.

Tài liệu chi tiết cho từng phần:

- [README backend](./backend/README.md)
- [README frontend](./frontend/README.md)

## Công nghệ sử dụng

- Frontend: React, Vite, Axios, Socket.io Client
- Backend: Node.js, Express, Socket.io
- Database: Firebase Firestore
- Notification: Twilio SMS, Nodemailer email

## Cấu trúc project

```text
classroom-management/
|-- backend/
|   |-- src/
|   |   |-- integrations/
|   |   |   |-- email/
|   |   |   |-- firebase/
|   |   |   `-- twilio/
|   |   |-- modules/
|   |   |   |-- auth/
|   |   |   |-- chat/
|   |   |   `-- students/
|   |   |-- scripts/
|   |   |   `-- seedFirebase.js
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   |-- package.json
|   `-- README.md
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- App.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package.json
|   `-- README.md
|-- screenshots/
|-- .gitignore
`-- README.md
```

Backend được tổ chức theo hướng Modular Monolith kết hợp Layered Architecture:

```text
router -> controller -> service -> repository -> Firebase
```

## Cách chạy project

### 1. Chuẩn bị backend env

Tạo file `backend/.env` dựa theo `backend/.env.example`.

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_PHONE=

EMAIL_HOST=
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
```

Nếu Twilio hoặc email chưa cấu hình được thì app vẫn có fallback để test local.

### 2. Chạy backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend chạy ở:

```text
http://localhost:4000
```

### 3. Chạy frontend

Mở terminal khác:

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy ở:

```text
http://localhost:5173
```

## Tài khoản demo

Instructor:

```text
+15550000001
```

Student:

```text
mia@classroom.local
```

## Một số màn hình chính

Các ảnh nằm trong thư mục `screenshots/`.

### Đăng nhập bằng số điện thoại

![Phone login](./screenshots/01-phone-login.png)

### Nhập mã xác thực điện thoại

![Phone verification](./screenshots/02-phone-verification.png)

### Đăng nhập bằng email

![Email login](./screenshots/03-email-login.png)

### Nhập mã xác thực email

![Email verification](./screenshots/04-email-verification.png)

### Trang quản lý học sinh của instructor

![Instructor students](./screenshots/05-instructor-students.png)

### Form thêm học sinh

![Add student](./screenshots/06-add-student.png)

### Trang giao bài học

![Instructor lessons](./screenshots/07-instructor-lessons.png)

### Chat phía instructor

![Instructor chat](./screenshots/08-instructor-chat.png)

### Trang bài học của student

![Student lessons](./screenshots/09-student-lessons.png)

### Chat phía student

![Student chat](./screenshots/10-student-chat.png)

## Chạy nhanh nếu đã cài package

Mở 2 terminal riêng.

Terminal backend:

```bash
cd backend
npm install
npm run dev
```

Terminal frontend:

```bash
cd frontend
npm install
npm run dev
```

Sau đó mở:

```text
http://localhost:5173
```
