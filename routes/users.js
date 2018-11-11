var express = require('express');
var router = express.Router();
//引入crypto模块
var md5 = require("crypto")
//引入mysql模块
var mysql = require("mysql")
//2 链接数据库
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'smms'
});
//3 打开数据库链接
connection.connect();
//设置member_add路由
router.post('/add', function (req, res, next) {
  //结构赋值
  let { username, pass, region } = req.body
  //对密码进行md5加密
  pass = md5.createHash("md5").update(pass).digest("hex")
  //写入数据库
  //Sql语句
  var sqlStr = "insert into usertable(userName,userPwd,userGroup) values(?,?,?)"
  //参数数组
  var sqlPramas = [username, pass, region]
  connection.query(sqlStr, sqlPramas, (err, results) => {
    if (err) {
      throw err
    }
    if (results.affectedRows > 0) {
      res.send({ "isOK": true, "msg": "账号添加成功" })
    } else {
      res.send({ "isOK": false, "msg": "账号添加失败" })
    }
  })




});
//设置member_list路由
router.get("/list", (req, res) => {
  //查询数据库
  //定义Sql语句
  var sqlstr = "select * from usertable order by u_id DESC"
  connection.query(sqlstr, (err, userslist) => {
    if (err) {
      throw err
    }
    //将查询到的数据返回前端
    res.send(userslist)
  })
})
//设置member_list delete路由
router.get("/delete", (req, res) => {
  let { u_id } = req.query
  //定义sql语句
  var sqlstr = "delete from usertable where u_id=?"
  //定义参数数组
  var sqlPramas = [u_id]
  //执行sql语句
  connection.query(sqlstr, sqlPramas,(err, results) => {
    if (err) {
      throw err
    }
    if (results.affectedRows > 0) {
      res.send({ "isOK": true, "msg": "账号删除成功" })
    } else {
      res.send({ "isOK": false, "msg": "账号删除失败" })
    }
  })




})
//设置member_edit路由，通过id获取数据
router.get('/getDataById', function (req, res, next) {
  //结构赋值
  let u_id = req.query.u_id
  //查找数据库
  //Sql语句
  var sqlStr = "select * from usertable where u_id=?"
  //参数数组
  var sqlPramas = [u_id]
  connection.query(sqlStr, sqlPramas, (err, userdata) => {
    if (err) {
      throw err
    }
    res.send(userdata)
  })
})
//设置edit路由，通过id修改i数据
router.post('/edit', function (req, res, next) {
  //结构赋值
  let { username, pass, region, u_id, oldPwd } = req.body
  //对密码进行md5加密
  //判断密码是否更改，更改才加密，否则不加密
  if (pass !== oldPwd) {
    pass = md5.createHash("md5").update(pass).digest("hex")
  }
  //写入数据库
  //Sql语句
  var sqlStr = "update usertable set userName=?,userPwd=?,userGroup=? where u_id=?"
  //参数数组
  var sqlPramas = [username, pass, region, u_id]
  connection.query(sqlStr, sqlPramas, (err, results) => {
    if (err) throw err
    if (results.affectedRows > 0) {
      res.send({ "isOK": true, "msg": "账号修改成功" })
    } else {
      res.send({ "isOK": false, "msg": "账号修改失败" })
    }
  })
})
//设置checkuser路由
router.post("/checkUsers",(req, res, next)=>{
  let {username,checkPass}=req.body
  //对密码进行md5加密
  checkPass = md5.createHash("md5").update(checkPass).digest("hex")
  //定义sql语句，查找数据库进行对比
  var sqlstr="select u_id from usertable where userName=? and userPwd=?"
  var sqlPramas=[username,checkPass]
  //执行sql语句
  connection.query(sqlstr,sqlPramas,(err,result)=>{
    if(err) throw err;
    if(result.length>0){
      //写入cookie
      res.cookie("username",username)
      res.cookie("u_id",result[0].u_id)
      res.send({isOK:true,msg:"用户登陆成功"})
    }else{
      res.send({isOK:false,msg:"用户登陆失败"})
    }
  })
})
//设置退出登陆的路由
router.get("/signOut",(req,res,next)=>{
  //清除cooki
  res.clearCookie("username")
  res.clearCookie("u_id")
  res.redirect("/signin.html")
})
//验证身份的合法性，有cookie则合法，否则不合法
router.get("/checkCookie",(req,res,next)=>{
  //读取cookie
  var username=req.cookies.username
  if(!username){
    res.send("alert('非法入侵，请登陆');location.href='signin.html'")
  }else{
    res.send("")
  }
})
module.exports = router;
