var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../model/goods');
var User = require('../model/users');

mongoose.connect('mongodb://127.0.0.1:27017/mi',{ useNewUrlParser: true });

mongoose.connection.on("connected",function(){
    console.log('数据库连接成功');
})
mongoose.connection.on("error",function(){
    console.log("数据库连接失败");
})
mongoose.connection.on("disconnected",function(){
    console.log('数据库连接断开');
})

router.get('/list', function(req, res, next) {
    let page = req.param("page");
    let pageSize = parseInt(req.param("pageSize"));
    let sort = req.param("sort");
    let priceLevel = req.param("priceLevel");

    let params = {};
    let skip = (page-1)*pageSize;
    var min = 0 ,max = 0;
    switch(priceLevel){
        case "0" : min = 0;max = 500;break;
        case "1" : min = 500;max = 1500;break;
        case "2" : min = 1500;max = 3000;break;
        case "3" : min = 3000;max = 5000;break;
        default:min = 0;max=5000;break
    }
    params = {
        productPrice:{
            $gt:min,
            $lte:max
        }
    }
    
    let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
    goodsModel.sort({'productPrice':sort}); 
    goodsModel.exec(function(err,doc){
        if(err){
            res.json({
                status:1,
                msg:err.message
            })
        }else{
            res.json({
                status:0,
                msg:'',
                result:{
                    count:doc.length,
                    list:doc
                }
            })
        }
    })
});

router.post("/addCart",function(req,res,next){
    var userId = "3115005483",productId = parseInt(req.body.productId);
    

    User.findOne({userId:userId},function(err,userDoc){
        if(err){
            res.json({
                status:1,
                msg:err.message
            })
        }else{
            if(userDoc){
                let goodsItem = '';
                userDoc.cartList.forEach(function(item){
                    if(item.productId == productId){
                        goodsItem = item;
                        item.productNum++;
                    }
                })
                if(goodsItem){
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
                }else{
                    Goods.findOne({productId:productId},function(err,doc){
                        var newobj = null;
                        if(err){
                            res.json({
                                status:1,
                                msg:err.message
                            })
                        }else{
                            if(doc){
                                newobj = {
                                    productNum: 1,
                                    checked: 1,
                                    productId: doc.productId,
                                    producName: doc.producName,
                                    productPrice: doc.productPrice,
                                    productName: doc.productName,
                                    productImg: doc.productImg,
                                }
                                userDoc.cartList.push(newobj);
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
                }
            }
        }
    })


})

module.exports = router;