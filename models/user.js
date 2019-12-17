const fs = require('fs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        username: {type: String, required: true},
        password: {type: String, required: true},
        fullname: {type: String},
        role: {type: String, default: "Standart user"},
        registeredAt: {type: Date, default: Date.now},
        avaUrl: {type: String},
        isDisabled: {type: Boolean, default: false},
        chatId: {type: String, default:''},
    }
);
const userModel = mongoose.model('User',userSchema);
class User {

    constructor(id, login, role, fullname, registeredAt, avaUrl, isDisabled) {
        this.id = id; // number
        this.login = login;  // string
        this.role = role;
        this.fullname = fullname;  // string
        this.registeredAt = registeredAt;
        this.avaUrl = avaUrl;
        this.isDisabled = isDisabled;
    }

    // static functions to access storage

    // returns user with id or undefined
    static getById(id) {
        return userModel.findById(id);

    }
    static findByLogin(username) {
        return userModel.findOne({
            username: username
        });
    }
    static update(ava, id, user)
    {
        user.avaUrl = ava;
        return userModel.findByIdAndUpdate(id, user, {new: true});
    }
    // returns an array of all users in storage
    static getAll() {
        return userModel.find();

    }

    static insert(file_url, new_user, hash) {
        new_user.password = hash;
        new_user.avaUrl = file_url;
        return new userModel(new_user).save();


}
}
module.exports = User;
