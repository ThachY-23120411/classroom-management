import { api } from './httpClient'

export function requestPhoneAccessCode(phoneNumber) {
  return api.post('/createAccessCode', {
    phoneNumber,
  })
}

export function validatePhoneAccessCode(phoneNumber, accessCode) {
  return api.post('/validateAccessCode', {
    phoneNumber,
    accessCode,
  })
}

export function requestEmailAccessCode(email) {
  return api.post('/LoginEmail', {
    email,
  })
}

export function validateEmailAccessCode(email, accessCode) {
  return api.post('/validateEmailAccessCode', {
    email,
    accessCode,
  })
}
