var mongoose = require("mongoose");

var recipeSchematic = new mongoose.Schema({
	name: String,
	image: String,
	mealType: String,
	protein: String,
	calories: Number,
	cookTimeInMinutes:Number,
	servingSize: Number,
	ingredients: String,
	directions: String
})

module.exports = mongoose.model("Recipe", recipeSchematic);