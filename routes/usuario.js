import express from "express"
const router = express.Router()
import mongoose from "mongoose"
import "../models/Usuario.js"
const Usuario = mongoose.model("usuarios")
import bcrypt from "bcryptjs"
import passport from "passport"

router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome === undefined || req.body.nome === null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email === undefined || req.body.email === null){
        erros.push({texto: "E-mail inválido"})
    }

    if(!req.body.senha || typeof req.body.senha === undefined || req.body.senha === null){
        erros.push({texto: "Senha inválida"})
    }

    if(req.body.senha.length < 4){
        erros.push({texto: "Senha deve conter no minímo 4 caracteres"})
    }
    
    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas devem ser iguais"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já possui uma conta cadastrada com esse e-mail")
                res.redirect("/usuarios/registro")
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }
                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {
                            req.flash("success_msg", "Usuário criado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }
})

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/deletar", (req, res) => {
    res.render("usuarios/deletar")
})

router.post("/deletar", (req, res,next) => {
    passport.authenticate("local", (err, user, info) => {
        if(err){
            return next(err);
        }
        if(!user){
            req.flash("error_msg", "E-mail ou senha incorretos");
            return res.redirect("/usuarios/deletar");
        }
        Usuario.deleteOne({_id: user._id})
            .then(() => {
                req.flash("success_msg", "Conta deletada com sucesso!");
                res.redirect("/");
            })
            .catch((err) => {
                req.flash("error_msg", "Houve um erro ao deletar a conta");
                res.redirect("/usuarios/deletar");
            });
    })(req, res, next);
})

router.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        req.flash("success_msg", "Deslogado com sucesso!")
        res.redirect("/")
    }) 
})

export default router