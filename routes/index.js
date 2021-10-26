import { Router } from "express"
import auth from "@auth"
import sql from "@sql"

var router = Router()

/* feed page. */
router.get('/feeds/start=([0-9]+)?/length=([0-9]+)?', async (req, res, next) => {
  console.log(req.params);
  const
    start = req.params[0],
    length = req.params[1],
    token = req.headers.authorization
  // console.log(token)
  let cmd, data = {
    code: 105
  }
  try {
    if (typeof (token) === 'undefined' || token === "null" || auth.isAuth(token) === false) {
      //游客 mode
      cmd = `select p.postId, p.context, p.img, p.date, u.username 
             from posts_data p, user_infos u
             where  u.userId=p.userId 
             order by p.date desc
             limit ${start},${length}`
    } else {
      // user mode
      const tokendata = await auth.getDataFromToken(token)
      cmd = ` select p.postId, p.context, p.img, p.date, u.username 
              from posts_data p, user_infos u
                  where p.userId in 
                    (select followId from follow_link 
                      where followerId=
                        (select userId from login_data where username='${tokendata.username}')
                    ) 
                  order by p.date
                  limit ${start},${length}`
    }

    data.code = 105
    data.data = await sql.doCmd(cmd)
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


export default router
