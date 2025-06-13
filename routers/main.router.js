
const router = require('express').Router();

router.get('/', (req,res)=> {
    res.render('main');
})

router.get('/exchangeDetail',(req,res)=>{
    res.render('exchangeDetail');
})

module.exports = router;