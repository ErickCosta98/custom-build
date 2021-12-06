const express = require('express')
const crypto = require('crypto')
const jweb = require('jsonwebtoken')
const users = require('../models/users')

const router = express.Router()
const signToken = (_id) => {
    return jweb.sign({_id},'mi-secreto',{
        expiresIn:60 * 60 * 24 * 365,
    })
}
router.post('/register',(req,res) => {
    const {email,password} = req.body
    crypto.randomBytes(16,(err,salt) => {
        const newSalt = salt.toString('base64')
        crypto.pbkdf2(password,newSalt,1000,64,'sha1',(err,key) =>{
            const newPass = key.toString('base64')
            users.findOne({email}).exec()
            .then(user => {
                if(user){
                    return res.send('usuario ya existe')
                }
                users.create({
                    email,
                    password: newPass,
                    salt: newSalt,
                }).then(() => {
                    res.status(201).send('usuario creado con exito')
                })
            })
        })
    } )
})
router.post('/login',(req,res) => {
    const {email,password} = req.body
    users.findOne({email}).exec()
    .then( user => {
        if(!user){
           return res.send(' usuario y/o contraseña incorrecta') 
        }
        crypto.pbkdf2(password,user.salt,1000,64,'sha1',(err,key) =>{
            const encrypPassword = key.toString('base64')
            if(user.password === encrypPassword){
                const token = signToken(user._id)
                return res.status(200).send(token)
            }
            return res.send(' usuario y/o contraseña incorrecta') 
        })

    })
})

module.exports = router