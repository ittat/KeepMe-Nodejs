var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresssss' });
});


// router.get('/post/:postid', function(req, res, next) {
//   req.param
// });





module.exports = router;
