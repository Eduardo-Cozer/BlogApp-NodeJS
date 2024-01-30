// Loading modules
    import express from "express"
    import handlebars from "express-handlebars"
    import bodyParser from "body-parser"
    const app = express()
    import admin from "./routes/admin.js"
    import path from "path"
    import mongoose from "mongoose"
    import flash from "connect-flash"
    import session from "express-session"
    import "./models/Postagem.js"
    const Postagem = mongoose.model("postagens")
    import "./models/Categoria.js"
    const Categoria = mongoose.model("categorias")
    import usuarios from "./routes/usuario.js"
    import passport from "passport"
    import authConfig from "./config/auth.js"
// Config
    //  Session
        app.use(session({
            secret: "anything",
            resave: true,
            saveUninitialized: true
        }))
        authConfig(passport)
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //  Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg") 
            res.locals.error_msg = req.flash("error_msg") 
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
            next()
        })
    //  Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    //  Handlebars
        app.engine("handlebars", handlebars.engine({defaultLayout: 'main', runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true
        }}))
        app.set("view engine", "handlebars")
    //  Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://127.0.0.1:27017/blogapp")
        .then(() => {
            console.log("Conectado com sucesso!")
        }).catch((err) => {
            console.log("Houve um erro: " + err)
        })
    //  Public
        app.use(express.static(path.join("C:/CIENCIA DA COMPUTACAO/Cursos/Nodejs/myblog/","public")))
// Routes
        app.get('/', (req, res) => {
            Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
                res.render("index", {postagens: postagens})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao exibir as postagens recentes")
                res.redirect("/404")
            })
            
        })

        app.get("/postagem/:slug", (req, res) => {
            Postagem.findOne({slug: req.params.slug}).then((postagem) => {
                if(postagem){
                    res.render("postagem/index", {postagem: postagem})
                }else{
                    req.flash("error_msg", "Esta postagem não existe")
                    res.redirect("/")
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao redirecionar para postagem")
                res.redirect("/")
            })
        })

        app.get("/categorias", (req, res) => {
            Categoria.find().then((categorias) => {
                res.render("categorias/index", {categorias: categorias})
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao exibir as categorias")
                res.redirect("/")
            })
        })

        app.get("/categorias/:slug", (req, res) => {
            Categoria.findOne({slug: req.params.slug}).then((categoria) => {
                if(categoria){
                    Postagem.find({categoria: categoria._id}).then((postagens) => {
                        res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                    }).catch((err) => {
                        req.flash("error_msg", "Houve um erro ao exibir os posts")
                        res.redirect("/")
                    })
                }else{
                    req.flash("error_msg", "Está categoria não existe")
                    res.redirect("/")
                }
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao carregar a categoria")
                res.redirect("/")
            })
        })

        app.get("/404", (req, res) => {
            res.send("Erro 404!")
        })

        app.use('/admin', admin)
        app.use('/usuarios', usuarios)
// Others
const PORT = 8080
app.listen(PORT, () => {
    console.log("Servidor rodando")
})
