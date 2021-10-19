/** 请求响应拦截器 */
import axios from 'axios'
import { stringify } from 'qs' // 引入qs模块，用来序列化post类型的数据


// 先导入vuex,因为我们要使用到里面的状态对象
// vuex的路径根据自己的路径去写
let token = null

axios.defaults.baseURL = 'http://localhost:3000'

axios.defaults.timeout = 10000 // 请求超时设置
axios.defaults.withCredentials = false // 表示跨域请求时是否需要使用凭证,默认否

// 添加请求拦截器
axios.interceptors.request.use(
    config => {
        // 每次发送请求之前判断vuex中是否存在token
        // 如果存在，则统一在http请求的header都加上token，这样后台根据token判断你的登录情况
        // 即使本地存在token，也有可能token是过期的，所以在响应拦截器中要对返回状态进行判断
        // const token = store.state.token;
        config.headers.Authorization = token;
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        return config
    },
    error => {
        console.log('请求过程出错')
        // console.log(error)
        return Promise.error(error)
    }
)

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么

    //如果响应status 为 未登陆101 和 登陆成功 102 ，需要更新 token

    //需要router到登陆页面
    console.log(response.data)
    if (response.data.code === 101 || response.data.code === 103)  {
        token = null
    }else if (response.data.code === 102) {
        token = response.data.token 
    }

    return response
}, function (error) {
    console.error('响应过程出错')
    console.error(error)
    return Promise.reject(error)
})


export default axios