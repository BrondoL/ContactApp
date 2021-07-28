const mongoose = require("mongoose");

const contactModel = mongoose.model("Contact", {
    nama: {
        type: String,
        required: true,
    },
    noHP: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
});

module.exports = contactModel;
