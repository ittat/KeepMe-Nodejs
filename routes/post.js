import sql from "@sql"
import auth from "@auth"
import { Router } from "express"
var router = Router()

const countPostLike = async (postId) => {
    const cmd = `select count(userId) from posts_likes where postId='${postId}'`
    return (await sql.doCmd(cmd))[0]['count(userId)']
}

const postCommits = async (postId) => {
    const cmd = `select p.* , u.username from posts_commits p, user_infos u where p.toPostId='${postId}' and u.userId=p.userId order by created_at`
    let result = null
    //没有commit 后段 mysql返回 []，docmd抛出异常
    // 所以要处理，区分是否有评论，异常返回 null
    try{
        result = await sql.doCmd(cmd)
    } finally{
        return result
    }
    
}


const countCommits = async (postId) => {
    const cmd = `select count(*) from posts_commits where toPostId='${postId}' `
    let result = null
    //没有commit 后段 mysql返回 []，docmd抛出异常
    // 所以要处理，区分是否有评论，异常返回 null
    try{
        result = (await sql.doCmd(cmd))[0]['count(*)']
    } finally{
        return result
    }
    
}

router.get('/:postid', async (req, res, next) => {
    const postid = req.params.postid
    let data = { code: 105 }
    const cmd = `select p.*, u.username, u.userImg
                from posts_data p, user_infos u   
                where p.postId=${postid} and u.userId=p.userId`
    try {
        const result = await sql.doCmd(cmd)
        result[0].like_sum = await countPostLike(postid)
        result[0].commits_sum = await countCommits(postid)
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
                const cmd = `insert into posts_data (userId, context, img, date) 
                            values ((select userId from login_data where username='${tokenData.username}'),
                                    '${postInfo.context}',
                                    '${postInfo.img}',
                                    (select now())
                            )`
                await sql.doCmd(cmd)
                data.code = 105
                data.data = '成功发表'
            } else {
                 data.msg = "提交内容不全"
                throw (Error)
            }
        } else {
            data.msg += " 认证不通过"
            throw (Error)
        }
    } catch (error) {
        data.code = 106
        data.msg = error
        if (error?.name == "JsonWebTokenError") {
            data.code = 103
        }
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
router.post('/:postid/like/:action', async (req, res, next) => {
    res.statusCode = 200;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Content-Type', 'application/json');
    let data = { code: 105 }
    const postid = req.params.postid
    const action = req.params.action
    const token = req.headers.authorization
    try {
        if (action != 'add' && action != 'remove') {
            throw ("请求不规范")
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
            throw ("未登陆或者请求不规范！")
        }

    } catch (error) {
        data.code = 106
        data.msg = error
        if (error?.name == "JsonWebTokenError") {
            data.code = 103
        }
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }
});


// PSOT /post/:id/commit
router.post('/:postid/commit', async (req, res, next) => {
    let data = { code: 105 }
    const postid = req.params.postid
    const token = req.headers.authorization
    try {
        if (req.body.context && auth.isAuth(token)) {
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
            throw ("未登陆或者发送不规范！")
        }

    } catch (error) {
        data.code = 106
        data.msg = error
        if (error?.name == "JsonWebTokenError") {
            data.code = 103
        }
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }

});


// 获取commit
router.get('/:postid/commit', async (req, res, next) => {
    let data = { code: 105 }
    const postid = req.params.postid
    try {

            data.code = 105
            data.data = await postCommits(postid)

    } catch (error) {
        data.code = 106
        data.msg = error
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
            // console.log(req.body);
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
            throw ("请求不规范！")
        }

    } catch (error) {
        data.code = 106
        data.msg = error
        if (error?.name == "JsonWebTokenError") {
            data.code = 103
        }
    } finally {
        res.statusCode = 200;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader('Content-Type', 'application/json');
        res.send(data)
    }

});

export default router