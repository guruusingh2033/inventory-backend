const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    title: String,
    description : String,
    quantity : Number,
    addedOn: Date,
    createdBy:Object,
    updatedBy:Object
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;

