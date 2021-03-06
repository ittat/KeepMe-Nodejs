import pool from "@main/mysql"
import jwt from "jsonwebtoken"
import sql from "@sql"

const PrivateKey = "test-key"


// data :{ username | password }
const signToken = (data) => {
    //此方法会生成一个token，第一个参数是数据，第二个参数是签名,第三个参数是token的过期时间可以不设置
    return jwt.sign(data, PrivateKey, {
        expiresIn: 60 * 60 * 24// 授权时效24小时
    })
}

const getPassWordFormDB = async (username) => {
    //mysql
        const cmd = `SELECT password FROM login_data where username='${username}'`
        return (await sql.doCmd(cmd))[0].password
        // pool.query(cmd, (err, res) => {
        //     if (err) {
        //         j(err)
        //     } else {
        //         if (typeof (res[0]) === 'undefined') {
        //             j()
        //         }
        //         r(res[0].password)

        //     }
        // })
}

const unsignatureToken = async (token) => {
    //此方法会将一个token解码，这个token是由哪些数据构成的，
    //只要传进去的secret正确，就可以解码出对应的数据，
    //第一个参数是一个token，第二个参数是一个签名
    return new Promise((r, j) => {
        jwt.verify(token, PrivateKey, (err, res) => {
            if (err) {
                j(err)
            } else {
                r(res)
            }
        })
    })
}

const getDataFromToken = async (token) =>{
    return await unsignatureToken(token)
}

const isAuth = async (token) => {
    let isOK
    try {
        if (!token) {
            throw (Error)
        }
        const data = await getDataFromToken(token)
        const password = await getPassWordFormDB(data.username)
        isOK = (data.password == password) ? true : false
    } catch (err) {
        // console.log(err)
        isOK = false
    } finally {
        return isOK
    }
}

export default { isAuth, signToken,getDataFromToken }