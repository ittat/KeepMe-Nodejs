// testMatch: **/__tests__/**/*.[jt]s?(x), **/?(*.)+(spec|test).[tj]s?(x)

import pool from "@main/mysql";

const pipline = []
const token = new Date().getTime().toString()

pipline.push(new Promise(r => {
  test('mysql link', () => {
    pool.query(`SELECT * FROM login_data where username='test'`, function (err, results, fields) {
      if (err) {
        console.log(err)
        expect().toThrow(Error)
      } else {
        expect(results[0].userId).toEqual(1)
        r()
      }
    })
  })
})
)


pipline.push(new Promise(r => {
  let cmd = `update login_data set token='${token}' where username='test'`
  test('set token', () => {
    pool.query(cmd, (err, results, fields) => {
      if (err) {
        console.log(err)
        expect().toThrow(Error)
      } else {
        expect(results).not.toBeNull()
        r()
      }
    })
  })
})
)

pipline.push(new Promise(r => {
  test('get token', () => {
    pool.query(`SELECT token FROM login_data where username='test'`, function (err, results, fields) {
      if (err) {
        console.log(err)
        expect().toThrow(Error)
      } else {
        expect(results[0].token).toBe(token)
        r()
      }
    })
  })
})
)


// run
Promise.all([pipline[0]]).then(() => {
  pipline[1].then(() => {
    pipline[2].then(() => {
      pool.end()
    })
  })
}).catch(() => {
  pool.end()
})
