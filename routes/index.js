import { Router } from "express"
import auth from "@auth"
import pool from "@main/mysql"

var router = Router()

/* feed page. */
router.get('/', async (req, res, next) => {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');
  const token = req.headers.authorization
  console.log(token)
  let cmd, data = {
    code: 105
  }
  if (typeof(token) === 'undefined' || token === "null" || auth.isAuth(token) === false) {
    //游客 mode
    cmd = `select * from posts_data order by 'date','time' limit 20`
  } else {
    // user mode
    const data = await auth.getDataFromToken(token)
    cmd = ` select * from posts_data 
                  where userId in 
                    (select followId from follow_link 
                      where followerId=
                        (select userId from login_data where username='${data.username}')
                    ) 
                  order by 'date','time'`
  }
  pool.query(cmd, (err, sqlres) => {
    if (err) {
      // 命令执行异常
      console.error(err)
      data.code = 106
      data.msg = err
    } else {
      if (sqlres[0]) {
        //正确获取
        data.code = 105
        data.data = sqlres
      } else {
        //空 没有相关posts
        data.code = 107
        data.msg = '没有相关posts'
      }
    }
    res.send(data)
  })
});


export default router
