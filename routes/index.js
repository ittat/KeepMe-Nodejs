
import pool from "@main/mysql";
import { Router } from "express";
var router = Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send(501) //Not Implemented
});


router.get('/post/:postid', function (req, res, next) {
  res.statusCode = 200;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Content-Type', 'application/json');
  const postid = req.params.postid
  let data = {
    code: 105
  }
  const cmd = `select * from posts_data where postId='${postid}'`
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
        data.data = sqlres[0]
      } else {
        //空 不存在 postid
        data.code = 107
        data.msg = '不存在 postid'
      }
    }
    res.send(data)
  })
});


export default router
