const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    holder_address: { type: String, required: true, unique: true },
    balance: { type: String, required: true },
    sol_address: { type: String, default: '' },
    amount: { type: Number, default: 0 },
    date: { type: Date, default: null }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
