import axios from 'axios'
// import { MessageBox, Message } from 'element-ui'
import { warning, error, confirm } from '@utils/message'
import store from '@/store'
// import { getToken } from '@/utils/auth'

let timeout = 8000
if (process.env.NODE_ENV === 'development') {
  // 开发环境方便调试，设置较长的超时时间。
  timeout = 0
}

// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: timeout // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent

    if (process.env.NODE_ENV === 'development') {
      // 开发环境方便调试，设置默认的token。
      config.headers['User-Account'] = 'UA-DEV-VUE'
      config.headers['User-Name'] = 'UN-DEV-VUE'
      config.headers['Tenant-Code'] = 'TC-DEV-VUE'
      config.headers['Org-Code'] = 'OC-DEV-VUE'
    }

    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers['X-Token'] = getToken()--------------------------------------%^&*((*&(*^%)))
    } else {
      // 报错提示会话超时=============
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data
    if (res.warning) {
      warning(res.warning)
    } else if (res.error) {
      error(res.error)
    }

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 'S') {
      // Message({
      //   message: res.message || 'Error',
      //   type: 'error',
      //   duration: 5 * 1000
      // })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        confirm('You have been logged out, you can cancel to stay on this page, or log in again', {
          title: 'Confirm logout',
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    error(error.message)
    return Promise.reject(error)
  }
)

export default service
