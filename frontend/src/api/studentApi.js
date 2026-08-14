import { api } from './httpClient'

export function getStudents(instructorPhone) {
  return api.get('/students', {
    params: instructorPhone ? { instructorPhone } : undefined,
  })
}

export function getStudent(phone) {
  return api.get(`/student/${encodeURIComponent(phone)}`)
}

export function createStudent(student) {
  return api.post('/addStudent', student)
}

export function updateStudent(phone, student) {
  return api.put(`/editStudent/${encodeURIComponent(phone)}`, student)
}

export function deleteStudentByPhone(phone) {
  return api.delete(`/student/${encodeURIComponent(phone)}`)
}

export function updateStudentProfile(profile) {
  return api.put('/editProfile', profile)
}
