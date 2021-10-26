#!/usr/bin/env node

import 'module-alias/register'
import createError from "http-errors"
import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"

import indexRouter from "@routes/index"
import usersRouter from "@routes/user"
import postsRouter from "@routes/post"

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "authorization");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});



app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/post', postsRouter);


//use 501 NOT Implemented flag - when catch 404 and forward to error handler
app.use(function(req, res, next) {
  // next(createError(404));
  res.sendStatus(501)
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app
