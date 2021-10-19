import pool from "@main/mysql";
import jwt from "jsonwebtoken";
import { Router } from "express";

var router = Router();

const KEY = "test-key"

const setToken = (data) => {
  return new Promise((r, j) => {
    const token = jwt.sign(data, KEY, {
      expiresIn: 60 * 60 * 24// 授权时效24小时
    })//此方法会生成一个token，第一个参数是数据，第二个参数是签名,第三个参数是token的过期时间可以不设置
    //mysql
    const cmd = `update login_data set token='${token}' where username='${data.username}'`
    pool.query(cmd, (err, res) => {
      if (err) {
        j(err)
      }
      r(token)
    })
  }).then((token) => {
    return token
  }).catch((e) => {
    console.error(e);
    return null
  })

}

const getToken = (data) => {
  //mysql
  return new Promise((r, j) => {
    const cmd = `SELECT token FROM login_data where username='${data.username}'`
    pool.query(cmd, (err, res) => {
      if (err) {
        console.error(err);
        j(err)
      } else {
        r(res[0].token)
      }
    })
  })
}

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
router.post('/login', (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');

  let data = {
    code: 102,
    token: null,
    msg: null
  }
  const password = req.body.password
  const username = req.body.username
  // const clientToken = req.headers.authorization
  // console.log(clientToken);

  //查询mysql
  const cmd = `SELECT password FROM login_data where username='${username}'`
  pool.query(cmd, (err, sqlres) => {
    if (err) {
      //mysql 执行异常
      data.code = 106
      data.msg = err
      res.send(data)

    } else if (typeof (sqlres[0]) == "undefined") {
      //查询未空，不存在
      data.code = 101
      data.msg = "username unmatch"
      res.send(data)
    } else {
      if (sqlres[0].password == password) {
        setToken(req.body).then(
          (token) => {
            data.token = token
            res.send(data)
          }
        )
      } else {
        data.msg = "unmatch password"
        data.code = 101
        res.send(data)
      }
    }

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
  const clientToken = req.headers.authorization
  console.log(clientToken);
  try {
    const userToken = await getToken(req.body)
    console.log(userToken);

    if (userToken == clientToken) {
      //验证通过，清除token
      const cmd = `update login_data set token=NULL where username='${username}'`
      pool.query(cmd, (err, sqlres) => {
        if (err) {
          //mysql 执行出错
          data.code = 106
          data.msg = err.sqlMessage
        } else {
          data.msg = '用户成功退出'
        }
        res.send(data)
      })
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
