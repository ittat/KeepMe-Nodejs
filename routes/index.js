
import { Router } from "express";
var router = Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Expresssss' });
});


// router.get('/post/:postid', function(req, res, next) {
//   req.param
// });


export default router
