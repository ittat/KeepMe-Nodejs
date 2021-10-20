import pool from "@main/mysql"
import sql from "@sql"
import { Router } from "express"
import auth from "@auth"

var router = Router()

router.post('/create', async (req, res, next) => {
  let data = { code: 102 }
  const password = req.body.password
  const username = req.body.username
  const email = req.body.email

  //查询mysql
  const cmd = `insert into login_data(username,password,email) value('${username}','${password}','${email}')`

  try {
    await sql.doCmd(cmd)
    data.msg = '成功注册'
  } catch (error) {
    data.code = 101
    data.msg = error
  } finally {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    res.send(data)
  }


})

router.post('/login', async (req, res, next) => {

  let data = { code: 102 }

  //查询mysql
  try {
    const cmd = `SELECT password FROM login_data where username='${req.body.username}'`
    const result = await sql.doCmd(cmd)
    if (result[0].password == req.body.password) {
      data.code = 102
      data.token = auth.signToken(req.body)
    } else {
      data.msg = "unmatch password"
      data.code = 101
    }
  } catch (error) {
    data.code = 101
    data.msg = error
  } finally {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    res.send(data)
  }
})


router.post('/logout', async (req, res, next) => {
  let data = { code: 103 }
  const username = req.body.username

  try {
    // NOTE: req.headers.authorization is string
    if (typeof (req.headers.authorization) === 'undefined' || req.headers.authorization == "null") {
      throw (Error)
    }
    else if (await auth.isAuth(req.headers.authorization)) {
      //验证通过，清除token
      //now TODO 前段 清除 token
    } else {
      //验证不通过
      throw (Error)
    }
  } catch (err) {
    data.code = 107
    data.msg = 'token 验证不通过'
  } finally {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    res.send(data)
  }

})


router.get('/:username', async (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');
  const data = { code: 105 }

  try {
    const cmd = `select * from user_infos where username='${req.params.username}'`
    data.data = (await sql.doCmd(cmd))[0]
    data.code = 105
  } catch (err) {
    data.code = 106
    data.msg = '没有此用户'
  } finally {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    res.send(data)
  }

})


export default router
