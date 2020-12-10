/**
 * json序列化的回调函数，忽略空值，如undefined、null、''
 * @param {*} key
 * @param {*} value
 */
function replacer(key, value) {
  // json序列化的回调函数
  switch (typeof value) {
    case 'number':
    case 'boolean':
      return value
    // case 'string':
    //   return value.trim() || undefined
    default:
      return value || undefined
  }
}

export function jsonToString(json) {
  return JSON.stringify(json, replacer)
}

function reviver(key, value) {
  return replacer(key, value)
}

export function stringToJson(string) {
  return JSON.parse(string, reviver)
}
