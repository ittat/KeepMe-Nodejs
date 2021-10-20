import axios from "@test/axios";
import qs from 'qs' // 引入qs模块，用来序列化post类型的数据

test('login sucesss', (done) => {
    const data = {
        'username': 'test',
        'password': '123'
    }
    // data + qs.stringfiy = "username=test&password=123"
    axios.post('/user/login', qs.stringify(data)).then(res => {
        // res.config ==> send
        // recovery <== res.data
        console.log(res.data)
        expect(res.data.code).toBe(102)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('get posts feed sucucess with token', (done) => {
    axios.get('/', {}).then(res => {
        console.log(res.data.code)
        expect(res.data.code).toBe(105)
        done()
    })
})

test('add like post sucucess with token', (done) => {
    axios.get('/post/2021/like/add', {}).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(105)
        done()
    })
})

test('remove like post sucucess with token', (done) => {
    axios.get('/post/2021/like/remove', {}).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(105)
        done()
    })
})

test('add post commit sucucess with token', (done) => {
    axios.post('/post/2021/commit', qs.stringify({
        context:"dhfjdkshfksdj456456cvxcjkvhcxjk 895435 jkhdsjkfh r423423h dssfj"
    })).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(105)
        done()
    })
})


test('send new post sucucess', (done) => {
    axios.post('/post', qs.stringify({
        context: "dsfdsfdsf jkhjksdfhjks jhdfjkds 323424 234324234 23432",
        img: "null"
    })).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(105)
        done()
    })
})

test('logout sucesss', (done) => {
    const data = {
        'username': 'test'
    }
    axios.post('/user/logout', qs.stringify(data)).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(103)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('login password failed', (done) => {
    const data = {
        'username': 'test',
        'password': '1234'
    }
    // data + qs.stringfiy = "username=test&password=123"
    axios.post('/user/login', qs.stringify(data)).then(res => {
        // res.config ==> send
        // recovery <== res.data
        console.log(res.data)
        expect(res.data.code).toBe(101)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})


test('login username failed', (done) => {
    const data = {
        'username': 'testfdsfsdfdsf',
        'password': '1234'
    }
    // data + qs.stringfiy = "username=test&password=123"
    axios.post('/user/login', qs.stringify(data)).then(res => {
        // res.config ==> send
        // recovery <== res.data
        console.log(res.data)
        expect(res.data.code).toBe(101)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('create username', (done) => {
    const data = {
        'username': 'test_create',
        'password': '1234',
        'email': '123434dsfdsfdsfdsfds@email.com'
    }
    axios.post('/user/create', qs.stringify(data)).then(res => {
        console.log(res.data)
        expect(res.data.code == 102 || res.data.code == 101).toBe(true)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('logout failed', (done) => {
    const data = {
        'username': 'test'
    }
    axios.post('/user/logout', qs.stringify(data)).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(107)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('get user info success', (done) => {
    axios.get('/user/test', {}).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(105)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('get user info failed', (done) => {
    axios.get('/user/testNULLL', {}).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(107)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})


test('get postid sucucess', (done) => {
    axios.get('/post/2021', {}).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(105)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('get postid unmatch sucucess', (done) => {
    axios.get('/post/1999999999', {}).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(107)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})

test('get posts feed sucucess without token', (done) => {
    axios.get('/', {}).then(res => {
        console.log(res.data.code)
        expect(res.data.code).toBe(105)
        done()
    }).catch(
        () => {
            expect().toThrow()
        }
    )
})


test('get post sum', (done) => {
    axios.get('/post/2025/like_sum', qs.stringify({})).then(res => {
        console.log(res.data)
        expect(res.data.code).toBe(105)
        done()
    })
})
