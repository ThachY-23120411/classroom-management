import { api } from './httpClient'

export function assignLesson(lesson) {
  return api.post('/assignLesson', lesson)
}

export function markLessonDone(phone, lessonId) {
  return api.post('/markLessonDone', {
    phone,
    lessonId,
  })
}
