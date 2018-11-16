var express = require('express');
var router = express.Router();
var User = require('../model/users');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {
  var params = {
    userName : req.body.userName,
    userPwd : req.body.userPwd
  }
  User.findOne(params,function(err,doc){
    if(err){
      res.json({
          status:1,
          msg:err.message
      })
    }else{
        if(doc){
          res.cookie("userId",doc.userId,{
            path:'/',
            maxAge:1000*60*60*3
          })
          res.cookie("userName",doc.userName,{
            path:'/',
            maxAge:1000*60*60*3
          })
          // req.session.user = doc;
          res.json({
              status:0,
              msg:'',
              result:{
                userName:doc.userName
              }
          })
       }else{
          res.json({
            status:1,
            msg:'账号或密码错误'
          })
       }
    }
  })
});

router.post('/logout', function(req, res, next) {
  res.cookie("userId",'',{
    path:'/',
    maxAge:-1
  })

  res.json({
    status:0,
    msg:'',
    result:''
  })
});

router.get('/checkLogin',function(req,res,next){
  if(req.cookies.userId){
    res.json({
      status:0,
      msg:'',
      result:{
        userName:req.cookies.userName
      }
    })
  }else{
    res.json({
      status:1,
      msg:'未登录',
      result:''
    })
  }
})

router.get('/cartList',function(req,res,next){
  var userId = req.cookies.userId;
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:0,
          msg:'',
          result:doc.cartList
        })
      }
    }
  })
})

router.post('/cart/del',function(req,res,next){
  var userId = req.cookies.userId, productId = req.body.productId;
  User.update({userId:userId
  },{
    $pull:{"cartList":{
      productId:productId
    }}
  },function(err,doc){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:0,
          msg:'',
          result:"success"
        })
      }
    }
  })
})

router.post('/cart/edit',function(req,res,next){
  var userId = req.cookies.userId, productId = req.body.productId,
      productNum = req.body.productNum,checked = req.body.checked;
  User.update({userId:userId,"cartList.productId":productId
  },{
    "cartList.$.productNum":productNum,
    "cartList.$.checked":checked
  },function(err,doc){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:0,
          msg:'',
          result:"success"
        })
      }
    }
  })
})

router.post('/cart/editAll',function(req,res,next){
  var userId = req.cookies.userId,checkAll = req.body.checkAll;
  User.findOne({userId:userId},function(err,user){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      if(user){
        user.cartList.forEach((item)=>{
          item.checked = checkAll;
        })
        user.save(function(err1,doc){
          if(err1){
            res.json({
              status:1,
              msg:err.message,
              result:''
            })
          }else{
            res.json({
              status:0,
              msg:'',
              result:"success"
            })
          }
        })
        
      }
    }
  })
})

router.get('/addressList',function(req,res,next){
  var userId = req.cookies.userId;
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:0,
          msg:'',
          result:doc.addressList
        })
      }
    }
  })
})

router.post("/addAddress",function(req,res,next){
  var userId = "3115005483",userName = req.body.userName,
      streetName = req.body.streetName,postCode = req.body.postCode,
      tel = req.body.tel,newobj = null;;
  User.findOne({userId:userId},function(err,userDoc){
      if(err){
          res.json({
              status:1,
              msg:err.message
          })
      }else{
          if(userDoc){
            var addressList = userDoc.addressList,addressId = 0;
            addressList.forEach((item)=>{
              if(item){
                if(Number(item.addressId)>addressId){
                  addressId = item.addressId;
                }    
              }else{
                addressId = '10001'
              }      
            })
            newobj = {
              addressId:addressId*1+1,
              userName: userName,
              streetName: streetName,
              postCode: postCode,
              tel: tel,
              isDefault: false
            }
            addressList.push(newobj);
            userDoc.save(function(err2,doc2){
                if(err2){
                    res.json({
                        status:1,
                        msg:err2.message
                    })
                }else{
                    res.json({
                        status:0,
                        msg:'',
                        result:"success"
                    })
                }
            })
                    
          }
      }
  })
})

router.post('/setDefault',function(req,res,next){
  var userId = req.cookies.userId, addressId = req.body.addressId;
  if(!addressId){
    res.json({
      status:1,
      msg:"地址为空",
      result:''
    })
  }else{
    User.findOne({userId:userId},function(err,doc){
      if(err){
        res.json({
          status:1,
          msg:err.message,
          result:''
        })
      }else{
        if(doc){
          var addressList = doc.addressList;
          addressList.forEach((item)=>{
            if(item.addressId == addressId){
              item.isDefault = true;
            }else{
              item.isDefault = false;
            }           
          })
          doc.save(function(err1,doc1){
            if(err1){
              res.json({
                status:1,
                msg:err.message,
                result:''
              })
            }else{
              res.json({
                status:0,
                msg:'',
                result:''
              })
            }
          })
        }
      }
    })
  }
})

router.post('/delAddress',function(req,res,next){
  var userId = req.cookies.userId, addressId = req.body.addressId;
  User.update({userId:userId
  },{
    $pull:{"addressList":{
      addressId:addressId
    }}
  },function(err,doc){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        res.json({
          status:0,
          msg:'',
          result:"success"
        })
      }
    }
  })
})

router.post('/payMent',function(req,res,next){
  var userId = req.cookies.userId, orderTotal = req.body.orderTotal,
      addressId = req.body.addressId;
  User.findOne({
    userId:userId
  },function(err,doc){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      if(doc){
        var address = [],goodsList=[];
        doc.addressList.filter((item)=>{
          if(item.addressId == addressId){
            address.push(item);
          }
        })
        doc.cartList.filter((item)=>{
          if(item.checked == '1'){
            goodsList.push(item);
          }
        })

        var myDate = new Date();
        var order = {
          orderId:String(myDate.getTime()),
          orderTotal:orderTotal,
          addressInfo:address,
          goodsList:goodsList,
          orderStatus:'1',
          createDate:myDate.toLocaleString()
        }
        doc.orderList.push(order);
        doc.save(function(err2,doc2){
          if(err2){
              res.json({
                  status:1,
                  msg:err2.message,
                  result:''
              })
          }else{
              res.json({
                  status:0,
                  msg:'',
                  result:{
                    orderId:order.orderId,
                    orderTotal:order.orderTotal
                  }
              })
          }
        })
      }
    }
  })
})

router.get('/orderDetails',function(req,res,next){
  var userId = req.cookies.userId,orderId = req.param("orderId");
  User.findOne({userId:userId},function(err,doc){
    if(err){
      res.json({
        status:1,
        msg:err.message,
        result:''
      })
    }else{
      var orderList = doc.orderList;
      if(orderList.length>0){
        var orderTotal = 0;
        orderList.forEach((item)=>{
          if(item.orderId == orderId){
            orderTotal = item.orderTotal;
          }
        })
        if(orderTotal>0){
          res.json({
            status:0,
            msg:"",
            result:{
              orderId:orderId,
              orderTotal:orderTotal
            }
          })
        }else{
          res.json({
            status:1,
            msg:"查无此订单",
            result:''
          })
        }
      }else{
        res.json({
          status:1,
          msg:"用户未创建订单",
          result:''
        })
      }
    }
  })
})

module.exports = router;
