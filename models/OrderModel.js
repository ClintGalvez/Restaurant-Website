const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let orderSchema = Schema({
	restaurantId: { 
		type: Number, 
		required: true,
	},
	restaurantName: { 
		type: String, 
		required: true 
	},
	order: { 
		type: Schema.Types.Mixed, 
		required: true 
	},
	subtotal: { 
		type: Number, 
		required: true ,
		min: [0, "Price must be positive."]
	},
	fee: { 
		type: Number, 
		required: true,
		min: [0, "Price must be positive."]
	},
	tax: { 
		type: Number, 
		required: true,
		min: [0, "Price must be positive."]
	},
	total: { 
		type: Number, 
		required: true,
		min: [0, "Price must be positive."]
	},
	customerId: { 
		type: String, 
		required: true 
	}
});

module.exports = mongoose.model("Order", orderSchema);