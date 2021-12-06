const jweb = require('jsonwebtoken')
const users = require('../models/users')

module.exports = (req,res,next) => {
    const token = req.headers.authorization
    if(!token){
        return res.sendStatus(403)
    }
    jweb.verify(token,'mi-secreto',(err,decoded) => {
        const {_id} = decoded
        users.findOne({_id}).exec
        .then(user =>{
            req.user = user
            next()
        })
    })
}