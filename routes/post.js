import pool from "@main/mysql"
import auth from "@auth"
import { Router } from "express"
var router = Router()

const countPostLike = async (postId) => {
    return new Promise((r, j) => {
        const cmd = `select count(userId) from posts_likes where postId='${postId}'`
        pool.query(cmd, (err, sqlres) => {
            if (err) {
                // 命令执行异常
                j(err)
            } else {
                if (sqlres[0]) {
                    //正确获取
                    r(sqlres[0]['count(userId)'])
                } else {
                    //空 不存在 postid
                    j()
                }
            }
        })
    })
}

const postCommits = async (postId) => {
    return new Promise((r, j) => {
        const cmd = `select * from posts_commits where toPostId='${postId}' order by created_at`
        pool.query(cmd, (err, sqlres) => {
            if (err) {
                // 命令执行异常
                j(err)
            } else {
                //正确获取
                r(sqlres)
            }
        })
    })
}


router.get('/:postid', (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    const postid = req.params.postid
    let data = {
        code: 105
    }
    const cmd = `select * from posts_data where postId='${postid}'`
    pool.query(cmd, async (err, sqlres) => {
        if (err) {
            // 命令执行异常
            console.error(err)
            data.code = 106
            data.msg = err
        } else {
            if (sqlres[0]) {
                //正确获取
                sqlres[0].like_sum = await countPostLike(postid)
                sqlres[0].commits = await postCommits(postid)
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
        } else {
            throw (Error)
        }
    } catch (err) {
        data.code = 106
        data.msg = "发送失败"
        res.send(data)
    }
});

// /post/:id/like_sum
router.get('/:postid/like_sum', async (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    let data = { code: 105 }

    try {
        data.sum = await countPostLike(req.params.postid)
    } catch (err) {
        console.error(err)
        data.code = 106
        data.msg = err
    } finally {
        res.send(data)
    }
});

// /post/:id/like/:action
router.get('/:postid/like/:action', async (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    let data = { code: 105 }
    const postid = req.params.postid
    const action = req.params.action
    const token = req.headers.authorization
    try {
        if (action != 'add' && action != 'remove') {
            throw (Error)
        } else if (auth.isAuth(token)) {
            const tokenData = await auth.getDataFromToken(token)
            const cmdAddLike = `insert into posts_likes values (${postid},
            (select userId from login_data where username='${tokenData.username}'))`
            const cmdRemoveLike = `delete from posts_likes 
                                where postId=${postid} 
                                and 
                                userId=(select userId from login_data where username='${tokenData.username}')`
            const cmd = action === 'add' ? cmdAddLike : cmdRemoveLike
            pool.query(cmd, (err, sqlres) => {
                if (err) {
                    // 命令执行异常
                    console.error(err)
                    data.code = 106
                    data.msg = err
                } else {
                    //正确获取
                    data.code = 105
                    data.msg = sqlres
                }
            })

        } else {
            throw (Error)
        }

    } catch (err) {
        data.code = 106
        data.msg = "发送失败"
    } finally {
        res.send(data)
    }

});


// /post/:id/commit
router.post('/:postid/commit', async (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    let data = { code: 105 }
    const postid = req.params.postid
    const token = req.headers.authorization
    try {
        if (req.body.context && auth.isAuth(token)) {
            console.log(req.body);
            const tokenData = await auth.getDataFromToken(token)
            const cmd = `insert into posts_commits (userId,context,toPostId,created_at)
                        values (
                                    (select userId from login_data where username='${tokenData.username}'),
                                    "${req.body.context}",
                                    ${postid},
                                    (SELECT now())
                                )`

            pool.query(cmd, (err, sqlres) => {
                if (err) {
                    // 命令执行异常
                    console.error(err)
                    data.code = 106
                    data.msg = err
                } else {
                    //正确获取
                    data.code = 105
                    data.msg = sqlres
                }
            })

        } else {
            throw (Error)
        }

    } catch (err) {
        data.code = 106
        data.msg = "发送失败"
    } finally {
        res.send(data)
    }

});

// /post/:id/commit/to/:userId
router.post('/:postid/commit/to/:userId', async (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    let data = { code: 105 }
    const postid = req.params.postid
    const userId = req.params.userId
    const token = req.headers.authorization
    try {
        if (req.body.context && auth.isAuth(token)) {
            console.log(req.body);
            const tokenData = await auth.getDataFromToken(token)
            const cmd = `insert into posts_commits (userId,context,toPostId,toUserId,created_at)
                        values (
                                    (select userId from login_data where username='${tokenData.username}'),
                                    "${req.body.context}",
                                    ${postid},
                                    ${userId},
                                    (SELECT now())
                                )`

            pool.query(cmd, (err, sqlres) => {
                if (err) {
                    // 命令执行异常
                    console.error(err)
                    data.code = 106
                    data.msg = err
                } else {
                    //正确获取
                    data.code = 105
                    data.msg = sqlres
                }
            })

        } else {
            throw (Error)
        }

    } catch (err) {
        data.code = 106
        data.msg = "发送失败"
    } finally {
        res.send(data)
    }

});

export default router