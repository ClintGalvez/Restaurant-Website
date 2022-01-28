const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let userSchema = Schema({
	username: { 
		type: String, 
		required: true 
	},
	password: { 
		type: String, 
		required: true 
	},
	privacy: { 
		type: Boolean, 
		default: false
	},
	orders: [mongoose.Schema.Types.ObjectId]
});

// NOTE: the following removes the __v field that appears in the database
// let userSchema = Schema({
// 	username: { type: String, required: true },
// 	password: { type: String, required: true },
// 	privacy: { type: Boolean, required: true },
// }, {versionKey: false});

module.exports = mongoose.model("User", userSchema);
