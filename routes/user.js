import pool from "@main/mysql"
import sql from "@sql"
import { Router } from "express"
import auth from "@auth"

var router = Router()

const username2userId = async (username) => {
    const cmd = `select userId from login_data where username='${username}'`
    return (await sql.doCmd(cmd))[0].userId
}

const userId2username = async (userId) => {
    const cmd = `select username from login_data where userId='${userId}'`
    return (await sql.doCmd(cmd))[0].username
}

router.post('/create', async (req, res, next) => {
  let data = { code: 105 }
  const password = req.body.password
  const username = req.body.username
  const email = req.body.email

  //mysql
  const cmd = `insert into login_data(username,password,email)  value('${username}','${password}','${email}')`
  const cmd1 = `insert into  user_infos(username) value('${username}')`
  try {
    await sql.doCmd(cmd)
    await sql.doCmd(cmd1)
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
    const cmd = `SELECT password,username,userId FROM login_data where username='${req.body.username}'`
    const result = await sql.doCmd(cmd)
    if (result[0].password == req.body.password) {
      data.code = 102
      result[0].token = auth.signToken(req.body)
      result[0].password = ""
      data.data = result[0]
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


router.get('/logout', async (req, res, next) => {
  let data = { code: 103 }
  try {
    // NOTE: req.headers.authorization is string
    if (typeof (req.headers.authorization) == 'undefined' || req.headers.authorization == "null") {
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


router.get('/:userId', async (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');
  const data = { code: 105 }

  try {
  	let cmd = null
  	cmd = `select * from user_infos where userId='${req.params.userId}'`
    data.data = (await sql.doCmd(cmd))[0]

  	if (typeof (req.headers.authorization) != 'undefined' && req.headers.authorization != "null" && await auth.isAuth(req.headers.authorization)) 
  	{
  		try{
	  		const tokendata = await auth.getDataFromToken(req.headers.authorization)
	  		const userId = await username2userId(tokendata.username)
	    	cmd = `select * from follow_link where followerId='${req.params.userId}' and followId='${userId}'`
	    	data.data.isfollow = Boolean((await sql.doCmd(cmd))[0])
    	} catch(e){
    		console.log(e)
    		data.data.isfollow = false
    	}
    }
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



router.get('/:userId/follow', async (req, res, next) => {
  let data = { code: 105 }
  try {
    // NOTE: req.headers.authorization is string
    if (typeof (req.headers.authorization) === 'undefined' || req.headers.authorization == "null") {
      throw (Error)
    }
    else if (await auth.isAuth(req.headers.authorization)) {
      //验证通过
      const tokendata = await auth.getDataFromToken(req.headers.authorization)
	  const userId = await username2userId(tokendata.username)
	  let cmd = `insert into  follow_link value ('${req.params.userId}','${userId}')`
	  await sql.doCmd(cmd)
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


router.get('/:userId/unfollow', async (req, res, next) => {
  let data = { code: 105 }

  try {
    // NOTE: req.headers.authorization is string
    if (typeof (req.headers.authorization) === 'undefined' || req.headers.authorization == "null") {
      throw (Error)
    }
    else if (await auth.isAuth(req.headers.authorization)) {
      //验证通过
      const tokendata = await auth.getDataFromToken(req.headers.authorization)
	  const userId = await username2userId(tokendata.username)
	  let cmd = `delete from follow_link where followerId='${req.params.userId}' and followId='${userId}'`
	  await sql.doCmd(cmd)
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



router.get('/:userId/messages', async (req, res, next) => {
  let data = { code: 105 }

  try {
    // NOTE: req.headers.authorization is string
    if (typeof (req.headers.authorization) === 'undefined' || req.headers.authorization == "null") {
      throw (Error)
    }
    else if (await auth.isAuth(req.headers.authorization)) {
      //验证通过
      const tokendata = await auth.getDataFromToken(req.headers.authorization)
	  const userId = await username2userId(tokendata.username)
	  let cmd = `select * from messages where userId=${userId}`
	  // TODO 删除
	  data.data = await sql.doCmd(cmd)
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


export default router
