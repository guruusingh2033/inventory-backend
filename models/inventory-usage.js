const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
var Inventory = require('./inventory');

const inventoryUsageSchema = new mongoose.Schema({
    inventoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
    description : String,
    Usagequantity : Number,
    addedOn: Date,
    usedBy:Object
}, { timestamps: true });

const InventoryUsage = mongoose.model('InventoryUsage', inventoryUsageSchema);

module.exports = InventoryUsage;

