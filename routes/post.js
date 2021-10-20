import sql from "@sql"
import auth from "@auth"
import { Router } from "express"
var router = Router()

const countPostLike = async (postId) => {
    const cmd = `select count(userId) from posts_likes where postId='${postId}'`
    return (await sql.doCmd(cmd))[0]['count(userId)']
}

const postCommits = async (postId) => {
    const cmd = `select * from posts_commits where toPostId='${postId}' order by created_at`
    return await sql.doCmd(cmd)
}


router.get('/:postid', async (req, res, next) => {
    const postid = req.params.postid
    let data = { code: 105 }
    const cmd = `select * from posts_data where postId='${postid}'`
    try {
        const result = await sql.doCmd(cmd)
        result[0].like_sum = await countPostLike(postid)
        result[0].commits = await postCommits(postid)
        data.code = 105
        data.data = result[0]
    } catch (error) {
        console.error(error)
        data.code = 106
        data.msg = error
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }

});

// 发表post = /post
router.post('/', async (req, res, next) => {
    let data = { code: 105 }
    try {
        if (auth.isAuth(req.headers.authorization)) {
            const tokenData = await auth.getDataFromToken(req.headers.authorization)
            const postInfo = req.body
            if (postInfo.context && postInfo.img && tokenData.username) {
                const cmd = `insert into posts_data (userId, context, img, date, time) 
                            values ((select userId from login_data where username='${tokenData.username}'),
                                    '${postInfo.context}',
                                    '${postInfo.img}',
                                    (select curdate()),
                                    (select curtime())
                            )`
                await sql.doCmd(cmd)
                data.code = 105
                data.data = '成功发表'
            } else {
                throw (Error)
            }
        } else {
            throw (Error)
        }
    } catch (err) {
        data.code = 106
        data.msg = "发送失败"
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }
});

// /post/:id/like_sum
router.get('/:postid/like_sum', async (req, res, next) => {
    let data = { code: 105 }

    try {
        data.sum = await countPostLike(req.params.postid)
    } catch (error) {
        console.error(error)
        data.code = 106
        data.msg = error
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
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
            data.code = 105
            data.msg = await sql.doCmd(cmd)

        } else {
            throw (Error)
        }

    } catch (error) {
        data.code = 106
        data.msg = "发送失败"
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }
});


// /post/:id/commit
router.post('/:postid/commit', async (req, res, next) => {
    let data = { code: 105 }
    const postid = req.params.postid
    const token = req.headers.authorization
    try {
        if (req.body.context && auth.isAuth(token)) {
            // console.log(req.body);
            const tokenData = await auth.getDataFromToken(token)
            const cmd = `insert into posts_commits (userId,context,toPostId,created_at)
                        values (
                                    (select userId from login_data where username='${tokenData.username}'),
                                    "${req.body.context}",
                                    ${postid},
                                    (SELECT now())
                                )`

            data.code = 105
            data.msg = await sql.doCmd(cmd)
        } else {
            throw (Error)
        }

    } catch (error) {
        data.code = 106
        data.msg = "发送失败"
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }

});

// /post/:id/commit/to/:userId
router.post('/:postid/commit/to/:userId', async (req, res, next) => {
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
            data.code = 105
            data.msg = await sql.doCmd(cmd)
        } else {
            throw (Error)
        }

    } catch (error) {
        data.code = 106
        data.msg = "发送失败"
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }

});

export default router