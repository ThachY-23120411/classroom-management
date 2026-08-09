# Backend

Backend được viết bằng Express. Phần này xử lý đăng nhập bằng mã truy cập, quản lý học sinh, giao lesson, gửi email/SMS và chat realtime bằng Socket.io.

## Công nghệ dùng trong backend

- Node.js
- Express
- Firebase Admin SDK
- Firestore
- Socket.io
- Twilio
- Nodemailer
- dotenv

## Kiến trúc

Backend được chia theo kiểu Modular Monolith kết hợp Layered Architecture.

Luồng xử lý chính:

```text
router -> controller -> service -> repository -> Firebase
```

Ý tưởng là mỗi module tự giữ phần route, controller, service riêng. Controller chỉ nhận request/response. Service xử lý nghiệp vụ. Repository là nơi nói chuyện với Firestore.

```text
backend/
|-- src/
|   |-- integrations/
|   |   |-- email/
|   |   |-- firebase/
|   |   `-- twilio/
|   |-- modules/
|   |   |-- auth/
|   |   |-- chat/
|   |   `-- students/
|   |-- scripts/
|   |   `-- seedFirebase.js
|   |-- app.js
|   `-- server.js
|-- package.json
`-- README.md
```

## Cài đặt

Vào thư mục backend rồi cài package:

```bash
cd backend
npm install
```

## File `.env`

Tạo file `backend/.env`. Nội dung mẫu:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"

TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_FROM_PHONE=your-twilio-phone-number

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
EMAIL_FROM=your-email@gmail.com
```

Lưu ý: không đưa `.env` hoặc file service account Firebase lên GitHub.

## Chạy backend

```bash
npm run dev
```

Backend chạy ở:

```text
http://localhost:4000
```

Nếu muốn chạy bằng lệnh start:

```bash
npm run start
```

## Seed dữ liệu

Sau khi cấu hình Firebase xong, chạy:

```bash
npm run seed
```

Seed sẽ tạo sẵn instructor, student, lesson và message thread để test giao diện.

Quan hệ dữ liệu đang dùng:

```text
1 instructor quản lý nhiều student
1 student chỉ thuộc về 1 instructor
```

## Tài khoản demo

Instructor:

```text
Alex Instructor
Phone: +15550000001
```

```text
Jamie Instructor
Phone: +15550000006
```

Student:

```text
Mia Nguyen
Email: mia@classroom.local
Phone: +15550000002
```

```text
Casey Tran
Email: casey@classroom.local
Phone: +15550000005
```

```text
Riley Pham
Email: riley@classroom.local
Phone: +15550000007
```

## API chính

Base URL:

```text
http://localhost:4000
```

Auth:

| Method | Endpoint | Ý nghĩa |
|---|---|---|
| POST | `/createAccessCode` | Tạo mã đăng nhập theo số điện thoại |
| POST | `/validateAccessCode` | Kiểm tra mã đăng nhập điện thoại |
| POST | `/LoginEmail` | Tạo mã đăng nhập theo email student |
| POST | `/validateEmailAccessCode` | Kiểm tra mã đăng nhập email |

Student và lesson:

| Method | Endpoint | Ý nghĩa |
|---|---|---|
| POST | `/addStudent` | Instructor thêm student |
| GET | `/students?instructorPhone=xxx` | Lấy student của instructor đang đăng nhập |
| GET | `/student/:phone` | Xem chi tiết một student |
| PUT | `/editStudent/:phone` | Sửa thông tin student |
| DELETE | `/student/:phone` | Xóa student |
| POST | `/assignLesson` | Giao lesson cho student |
| GET | `/myLessons?phone=xxx` | Lấy lesson của student |
| POST | `/markLessonDone` | Student đánh dấu lesson đã xong |
| PUT | `/editProfile` | Student sửa profile |

Chat:

| Loại | Tên | Ý nghĩa |
|---|---|---|
| GET | `/chat/:studentPhone/messages` | Lấy lịch sử chat |
| Socket event | `joinRoom` | Vào phòng chat của student |
| Socket event | `sendMessage` | Gửi tin nhắn |
| Socket event | `newMessage` | Nhận tin nhắn mới |
| Socket event | `leaveRoom` | Rời phòng chat |

Chat được ràng buộc theo quan hệ instructor - student. Instructor chỉ chat đúng với student mà mình quản lý.

## Ghi chú về Twilio

Twilio trial có thể không gửi SMS được nếu số nhận chưa verify, chưa bật vùng gửi hoặc tài khoản bị giới hạn template.

Vì vậy backend vẫn giữ đúng flow:

```text
tạo code -> lưu Firebase -> gọi Twilio -> nếu Twilio fail thì trả code về response để test local
```

Ví dụ response khi Twilio fail:

```json
{
  "success": true,
  "data": {
    "phoneNumber": "+84906446134",
    "sms": {
      "sent": false,
      "provider": "twilio"
    },
    "accessCode": "123456"
  }
}
```

Phần fallback này chỉ dùng để test lúc làm bài. Khi dùng thật thì không nên trả `accessCode` ra response.

## Collection trong Firestore

`users`: lưu instructor và student.

`lessons`: lưu lesson đã giao.

`messages`: lưu thread chat theo student.
