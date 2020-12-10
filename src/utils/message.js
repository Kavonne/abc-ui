import { Message, MessageBox } from 'element-ui'

export function success(message, duration) {
  return Message.success({
    // showClose: true,
    message: message,
    duration: duration || 3000
  })
}

export function warning(message, duration) {
  return Message.warning({
    // showClose: true,
    message: message,
    duration: duration || 3000
  })
}

// export function info(message, duration) {
//   return Message.info({
//     // showClose: true,
//     message: message,
//     duration: duration || 3000
//   })
// }

export function error(message, duration) {
  return Message.error({
    // showClose: true,
    message: message,
    duration: duration || 5000
  })
}

export function alert(message, options) {
  return MessageBox.alert(message, (options && options.title) || '提示', options)
}

export function confirm(message, options) {
  return MessageBox.confirm(message, (options && options.title) || '提示', {
    type: 'warning'
  })
}

export function prompt(message, options) {
  return MessageBox.prompt(message, (options && options.title) || '提示', options)
}
