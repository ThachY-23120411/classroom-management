import { useEffect, useMemo, useState } from 'react'
import { io } from 'socket.io-client'
import { API_BASE_URL } from '../api/httpClient'

function MessageList({
  role,
  students,
  selectedStudent,
  instructorName,
  onSelectStudent,
}) {
  const displayInstructorName =
    instructorName || selectedStudent?.instructorName || 'Instructor'
  const cards =
    role === 'student'
      ? [
          {
            phone: selectedStudent?.phone || '+15550000002',
            name: displayInstructorName,
          },
        ]
      : students

  return (
    <section className="thread-list">
      <header>
        <h2>{role === 'student' ? displayInstructorName : 'Conversations'}</h2>
        <p>{cards.length} active threads</p>
      </header>
      {cards.map((student, index) => (
        <button
          className={`thread-card ${selectedStudent?.phone === student.phone ? 'active' : ''}`}
          key={student.phone || index}
          type="button"
          onClick={() =>
            onSelectStudent(role === 'student' ? selectedStudent : student)
          }
        >
          <span>{student.name.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{student.name}</strong>
          </div>
        </button>
      ))}
    </section>
  )
}

function ChatWindow({
  role,
  selectedStudent,
  instructorName,
  onResolveInstructorName,
}) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')

  const studentPhone = selectedStudent?.phone || '+15550000002'
  const displayInstructorName =
    instructorName || selectedStudent?.instructorName || 'Instructor'
  const socket = useMemo(() => io(API_BASE_URL, { autoConnect: false }), [])

  useEffect(() => {
    socket.connect()
    socket.emit('joinRoom', { studentPhone })

    socket.on('roomJoined', (payload) => {
      const roomMessages = payload.messages || []
      const instructorMessage = roomMessages.find(
        (message) => message.senderRole === 'instructor' && message.senderName,
      )

      setMessages(roomMessages)

      if (role === 'student' && instructorMessage?.senderName) {
        onResolveInstructorName(instructorMessage.senderName)
      }
    })

    socket.on('newMessage', (payload) => {
      setMessages((current) => [...current, payload.data])

      if (
        role === 'student' &&
        payload.data?.senderRole === 'instructor' &&
        payload.data?.senderName
      ) {
        onResolveInstructorName(payload.data.senderName)
      }
    })

    return () => {
      socket.emit('leaveRoom', { studentPhone })
      socket.off('roomJoined')
      socket.off('newMessage')
      socket.disconnect()
    }
  }, [onResolveInstructorName, role, socket, studentPhone])

  function handleSend(event) {
    event.preventDefault()

    if (!text.trim()) {
      return
    }

    socket.emit('sendMessage', {
      studentPhone,
      senderPhone:
        role === 'student'
          ? studentPhone
          : selectedStudent?.instructorPhone || '+15550000001',
      senderName:
        role === 'student'
          ? selectedStudent?.name || 'Student'
          : selectedStudent?.instructorName || 'Instructor',
      senderRole: role,
      text,
    })
    setText('')
  }

  return (
    <section className="chat-panel">
      <header>
        <div>
          <strong>
            {role === 'student'
              ? displayInstructorName
              : selectedStudent?.name}
          </strong>
          <p>Live chat room</p>
        </div>
      </header>
      <div className="chat-messages">
        {messages.length ? (
          messages.map((message) => (
            <div
              className={`chat-bubble ${message.senderRole === role ? 'own' : ''}`}
              key={message.id}
            >
              <p>{message.text}</p>
              <span>{message.senderName}</span>
            </div>
          ))
        ) : (
          <div className="empty-state chat-empty">
            <strong>No messages yet</strong>
            <p>Start the conversation from the reply box.</p>
          </div>
        )}
      </div>
      <form className="chat-reply" onSubmit={handleSend}>
        <input
          value={text}
          placeholder="Reply message"
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </section>
  )
}

function MessagesPage({ role, students, selectedStudent, onSelectStudent }) {
  const [resolvedInstructorName, setResolvedInstructorName] = useState('')

  useEffect(() => {
    setResolvedInstructorName('')
  }, [selectedStudent?.phone])

  const instructorName =
    selectedStudent?.instructorName || resolvedInstructorName || ''

  return (
    <section className="messages-layout">
      <MessageList
        role={role}
        students={students}
        selectedStudent={selectedStudent}
        instructorName={instructorName}
        onSelectStudent={onSelectStudent}
      />
      <ChatWindow
        role={role}
        selectedStudent={selectedStudent}
        instructorName={instructorName}
        onResolveInstructorName={setResolvedInstructorName}
      />
    </section>
  )
}

export default MessagesPage
