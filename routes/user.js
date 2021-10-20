import pool from "@main/mysql"
import { Router } from "express"
import auth from "@auth"

var router = Router()

const getUserInfos = (username) => {
  return new Promise((r, j) => {
    const cmd = `select * from user_infos where username='${username}'`
    pool.query(cmd, (err, res) => {
      if (err) {
        console.error(err)
        j(err)
      } else {
        r(res[0])
      }
    })
  })
}

router.post('/create', (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');

  let data = {
    code: 102,
    msg: null
  }
  const password = req.body.password
  const username = req.body.username
  const email = req.body.email

  //查询mysql
  const cmd = `insert into login_data(username,password,email) value('${username}','${password}','${email}')`
  pool.query(cmd, (err, sqlres) => {
    if (err) {
      //mysql 执行异常
      if (err.code == 'ER_DUP_ENTRY') {
        //mysql username 或者 email 已经存在
        data.code = 101
        data.msg = err.sqlMessage
      } else {
        data.code = 106
        data.msg = err

      }
    } else {
      //成功注册
      data.msg = '成功注册'
    }
    res.send(data)
  })
})

//TODO 改成 setToken await 写法 
router.post('/login', async (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');

  let data = { code: 102, token: null, msg: null }

  //查询mysql
  const cmd = `SELECT password FROM login_data where username='${req.body.username}'`
  await pool.query(cmd, async (err, sqlres) => {
    if (err) {
      //mysql 执行异常
      data.code = 106
      data.msg = err
    } else if (typeof (sqlres[0]) == "undefined") {
      //查询未空，不存在
      data.code = 101
      data.msg = "username unmatch"
    } else {
      if (sqlres[0].password == req.body.password) {
        data.code = 102
        data.token = auth.signToken(req.body)
      } else {
        data.msg = "unmatch password"
        data.code = 101
      }
    }
    res.send(data)
  })
})


router.post('/logout', async (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');

  let data = {
    code: 103,
    msg: null
  }
  const username = req.body.username

  try {
    if (!req.headers.authorization) {
      throw (Error)
    }
    if (await auth.isAuth(req.headers.authorization)) {
      //验证通过，清除token
      const cmd = `update login_data set token=NULL where username='${username}'`
      await pool.query(cmd, (err, sqlres) => {
        if (err) {
          //mysql 执行出错
          data.code = 106
          data.msg = err.sqlMessage
        } else {
          data.msg = '用户成功退出'
        }
      })
      res.send(data)
    } else {
      //验证不通过
      throw (Error)
    }
  } catch (err) {
    data.code = 107
    data.msg = 'token 验证不通过'
    res.send(data)
  }
})


router.get('/:username', async (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');

  const username = req.params.username
  try {
    let data = await getUserInfos(username)
    console.log(data)
    if (data) {
      //成功获取infos
      data.code = 105
    } else {
      //没有此用户
      data = { code: 107, msg: '没有此用户' }
    }
    res.send(data)
  } catch (err) {
    //系统异常抛出
    console.error(err)
    res.send({ code: 106, msg: '异常抛出！' })
  }

})


export default router
