import pool from "@main/mysql"
import auth from "@auth"
import { Router } from "express"
var router = Router()

router.get('/:postid', (req, res, next) => {
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

// 发表post = /post
router.post('/', async (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    const token = req.headers.authorization
    let data = { code: 105 }
    try {
        if (auth.isAuth(token)) {
            const tokenData = await auth.getDataFromToken(token)
            const postInfo = req.body
            if (postInfo.context && postInfo.img && tokenData.username) {
                const cmd = `insert into posts_data (userId, context, img, date, time) 
            values ((select userId from login_data where username='${tokenData.username}'),
                    '${postInfo.context}',
                    '${postInfo.img}',
                    (select curdate()),
                    (select curtime())
                    )`

                pool.query(cmd, (err, sqlres) => {
                    if (err) {
                        // 命令执行异常
                        console.error(err)
                        data.code = 106
                        data.msg = err
                    } else {
                        //成功
                        data.code = 105
                        data.data = '成功发表'
                    }
                    res.send(data)
                })
            } else {
                throw (Error)
            }
        }else{
            throw (Error)
        }
    } catch (err) {
        data.code = 106
        data.msg = "发送失败"
        res.send(data)
    }
});


export default router