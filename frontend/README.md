# Frontend

This is the React + Vite frontend for the Classroom Management application. It includes access-code login screens, instructor and student dashboards, lesson management, profile editing, and realtime chat.

## Tech Stack

- React
- Vite
- Axios
- Socket.io Client
- Lucide React

## Main Structure

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

The main UI is implemented in `src/App.jsx`, and the styling is in `src/App.css`.

## Installation

```bash
cd frontend
npm install
```

## Run Frontend

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

The frontend expects the backend to run at:

```text
http://localhost:4000
```

Start the backend before testing the full app.

## Build

```bash
npm run build
```

## Lint

```bash
npm run lint
```

## Implemented Screens

- Phone login
- Phone verification
- Email login
- Email verification
- Instructor student management
- Add, edit, and delete student
- Instructor lesson assignment
- Student lesson list and completion action
- Instructor-student chat
- Logout

## Login Flow

Instructors log in with a phone number. After the phone number is submitted, the backend creates an access code, stores it in Firebase, and tries to send it through Twilio.

Students can log in with email. The backend creates an access code, stores it in Firebase, and sends it by email if SMTP is configured.

Demo accounts:

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

## UI Business Rules

- An instructor only sees students assigned to that instructor.
- A newly added student is linked to the instructor who is currently logged in.
- A student only chats with the assigned instructor.
- An instructor can open each student conversation separately.
- Lessons are rendered from Firebase data instead of hardcoded UI data.
- Static labels such as `Active`, `Online`, and `No recent message` are not shown unless backed by real data.
- The current frontend session is saved in `localStorage`, so refreshing the page keeps the user on the dashboard until logout.

## Screenshots

The root README displays screenshots from the `screenshots/` folder:

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
