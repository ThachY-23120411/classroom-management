# Backend

This is the Express backend for the Classroom Management application. It handles access-code authentication, student management, lesson assignment, Firebase persistence, SMS/email delivery, and realtime chat with Socket.io.

## Tech Stack

- Node.js
- Express
- Firebase Admin SDK
- Firestore
- Socket.io
- Twilio
- Nodemailer
- dotenv

## Architecture

The backend is organized as a Modular Monolith with layered modules.

Main request flow:

```text
router -> controller -> service -> repository -> Firebase
```

Each module owns its route, controller, service, and repository files. Controllers handle HTTP input/output, services contain business logic, and repositories talk to Firestore.

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

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create `backend/.env`. You can copy the shape from `backend/.env.example`.

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

Do not commit `.env` or Firebase service account keys.

## Run Backend

Development mode:

```bash
npm run dev
```

Backend URL:

```text
http://localhost:4000
```

Production-style start:

```bash
npm run start
```

## Seed Data

After Firebase is configured, run:

```bash
npm run seed
```

The seed script creates demo instructors, students, assigned lessons, and chat threads.

Data relationship:

```text
One instructor manages many students
One student belongs to one instructor
```

## Demo Accounts

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

## API Endpoints

Base URL:

```text
http://localhost:4000
```

Auth:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/createAccessCode` | Create a phone access code |
| POST | `/validateAccessCode` | Validate a phone access code |
| POST | `/LoginEmail` | Create an email access code for a student |
| POST | `/validateEmailAccessCode` | Validate a student email access code |

Students and lessons:

| Method | Endpoint | Description |
|---|---|---|
| POST | `/addStudent` | Add a student and link the student to an instructor |
| GET | `/students?instructorPhone=xxx` | Get students managed by one instructor |
| GET | `/student/:phone` | Get one student profile with lessons |
| PUT | `/editStudent/:phone` | Update student information |
| DELETE | `/student/:phone` | Delete a student |
| POST | `/assignLesson` | Assign a lesson to a student |
| GET | `/myLessons?phone=xxx` | Get lessons assigned to a student |
| POST | `/markLessonDone` | Mark a lesson as completed |
| PUT | `/editProfile` | Update a student profile |

Chat:

| Type | Name | Description |
|---|---|---|
| GET | `/chat/:studentPhone/messages` | Get chat history |
| Socket event | `joinRoom` | Join a student's chat room |
| Socket event | `sendMessage` | Send a message |
| Socket event | `newMessage` | Receive a new message |
| Socket event | `leaveRoom` | Leave a chat room |

Chat is scoped by instructor-student ownership. An instructor should only chat with students assigned to that instructor.

## Twilio Trial Fallback

Twilio trial accounts can fail to send SMS if the recipient number is not verified, geo permissions are disabled, or trial messaging rules block the request.

The backend still keeps the expected flow:

```text
create code -> save code to Firebase -> try Twilio -> return a development code if Twilio fails
```

Example response when SMS delivery fails:

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

This fallback is intended for local testing only. A production flow should not expose access codes in API responses.

## Firestore Collections

`users`: instructors and students.

`lessons`: assigned lesson documents.

`messages`: chat threads grouped by student.
