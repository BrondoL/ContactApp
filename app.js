const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

require("./utils/db");
const contactModel = require("./models/contactModel");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("secret"));
app.use(flash());
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: "secret",
        resave: true,
        saveUninitialized: true,
    })
);
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    const data = {
        title: "Home Contact App",
        layout: "layouts/main",
        active: "Home",
    };
    res.render("index", data);
});

app.get("/about", (req, res) => {
    const data = {
        title: "About Me",
        layout: "layouts/main",
        active: "About",
    };
    res.render("about", data);
});

app.get("/contact", async (req, res) => {
    const contacts = await contactModel.find();
    const data = {
        title: "Daftar Contact",
        layout: "layouts/main",
        active: "Contact",
        contacts,
        msg: req.flash("msg"),
    };
    res.render("contact", data);
});

app.get("/contact/add", (req, res) => {
    const data = {
        title: "Tambah Data Contact",
        layout: "layouts/main",
        active: "Contact",
    };
    res.render("add-contact", data);
});

const validation = [
    check("email", "Email tidak valid!").isEmail(),
    check("noHP", "No HP tidak valid!").isMobilePhone("id-ID"),
    body("nama").custom(async (value) => {
        const duplikat = await contactModel.findOne({ nama: value });
        if (duplikat) {
            throw new Error("Nama contact sudah digunakan!");
        }
        return true;
    }),
];
app.post("/contact", validation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const data = {
            title: "Tambah Data Contact",
            layout: "layouts/main",
            active: "Contact",
            errors: errors.array(),
        };
        res.render("add-contact", data);
    } else {
        contactModel.insertMany(req.body, (error, result) => {
            req.flash("msg", "Data contact berhasil ditambahkan!");
            res.redirect("/contact");
        });
    }
});

app.get("/contact/:id", async (req, res) => {
    const contact = await contactModel.findOne({ _id: req.params.id });
    const data = {
        title: "Detail Contact",
        layout: "layouts/main",
        active: "Contact",
        contact,
    };
    res.render("detail", data);
});

app.delete("/contact", async (req, res) => {
    contactModel.deleteOne({ _id: req.body.id }).then((result) => {
        req.flash("msg", "Data contact berhasil dihapus!");
        res.redirect("/contact");
    });
});

app.get("/contact/edit/:id", async (req, res) => {
    const contact = await contactModel.findOne({ _id: req.params.id });
    const data = {
        title: "Edit Data Contact",
        layout: "layouts/main",
        active: "Contact",
        contact,
    };
    res.render("edit-contact", data);
});

const editValidation = [
    check("email", "Email tidak valid!").isEmail(),
    check("noHP", "No HP tidak valid!").isMobilePhone("id-ID"),
    body("nama").custom(async (value, { req }) => {
        const duplikat = await contactModel.findOne({ nama: value });
        if (value !== req.body.namaAwal && duplikat) {
            throw new Error("Nama contact sudah digunakan!");
        }
        return true;
    }),
];
app.put("/contact", editValidation, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const data = {
            title: "Edit Data Contact",
            layout: "layouts/main",
            active: "Contact",
            errors: errors.array(),
            contact: req.body,
        };
        res.render("edit-contact", data);
    } else {
        contactModel
            .updateOne(
                { _id: req.body._id },
                {
                    $set: {
                        nama: req.body.nama,
                        noHP: req.body.noHP,
                        email: req.body.email,
                    },
                }
            )
            .then((result) => {
                req.flash("msg", "Data contact berhasil diubah!");
                res.redirect("/contact");
            })
            .catch((error) => console.log(error));
    }
});

app.use("/", (req, res) => {
    res.status(404);
    res.send("<h1>404!</h1>");
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
