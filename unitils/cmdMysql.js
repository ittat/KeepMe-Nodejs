import pool from "@main/mysql"

const doCmd = async (cmd) => {
    return new Promise((r, j) => {
        pool.query(cmd, (err, res) => {
            if (err) {
                // 命令执行异常
                console.log("命令执行异常!!!!!!!")
                j(err)
            } else if (res.code) {
                // 操作异常
                // res = { sqlMessage, code}
                console.log("操作异常!!!!!!!")
                j(res)
            } else {
                //正常输出
                // 有返回结果，res = []
                if (typeof(res) == "object" && res.length == 0) {
                    console.log("jie@@@@@@@");
                    j(res)
                } else {
                    // 无返回结果 sqlres = {message: ''}
                    console.log("确认无返回结果!")
                    r(res)
                }
            }
        })
    })
}

export default { doCmd }