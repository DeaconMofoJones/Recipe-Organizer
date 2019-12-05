var mongoose = require("mongoose");

var savedRecipeSchematic = new mongoose.Schema({
	id:Number,
	title:String,
	image: String,
	readyInMinutes: Number,
	servings: Number,
	spoonacularScore: Number,
	healthScore:Number,
	nutrition: Object,
	instructions: String,
	analyzedInstructions: Array,
	extendedIngredients: Array
})

module.exports = mongoose.model("SavedRecipe", savedRecipeSchematic);