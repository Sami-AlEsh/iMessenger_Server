const jwt = require('jsonwebtoken');
const response = require('../shared/responseForm');

module.exports = (req, res ,next) => {
    if(!req.get('Authorization')){
        response.data = null ;
        response.status = false ;
        response.errors = ' Please Add Token To Headers In Req ';
        res.json(response);
    }
    let reqHeader = req.get('Authorization');
    console.log(reqHeader);
    jwt.verify(reqHeader,'secretForNow', (err, result)=>{
        if(!err){
            next();
        } else {
            response.status= false ;
            response.data = null ;
            response.errors = 'Please Log-in Then Try Again :-) ';
            res.json(response);
        }
    });
};
