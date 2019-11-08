var express 	= require("express"),
app				= express(),
mongoose		= require("mongoose"),
methodOverride 	= require("method-override"),
bodyParser 		= require("body-parser"),
port			= process.env.PORT || 3000,
mongoLocal		= "mongodb://localhost:27017/recipes",
mongoServer		= "mongodb+srv://deaconmofojones:Chuletas1@merchapp-a2iob.azure.mongodb.net/test?retryWrites=true&w=majority"


mongoose.connect(mongoLocal, { useNewUrlParser:true }, function(err){
	if (err) {
		console.log("connecting to online mongo server");
		mongoose.connect(mongoServer, {useNewUrlParser:true}, function(err){
			if (err) {
				console.log(err);
			}
			else{
				console.log("successfully connected to mongo database")
			}
		})
	} else	{
		console.log("successfully connected to local mongo database")
	}
});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

var recipeSchematic = new mongoose.Schema({
	name: String,
	image: String,
	mealType: String,
	protein: String,
	calories: Number,
	cookTimeInMinutes:Number,
	servingSize: Number,
	ingredients: Array,
	directions: String
})

var Recipe = mongoose.model("Recipe", recipeSchematic);

Recipe.create({
	name: "chicken salad",
	image: "img url",
	mealType: "lunch",
	protein: "chicken",
	calories: 50,
	cookTimeInMinutes:30,
	servingSize: 3,
	ingredients: ["chicken","salad","ranch dressing"],
	directions: "step 1. step 2. step 3."
})

app.get("/", function(req,res){
	res.redirect("/recipes");
})

app.get("/recipes", function(req,res){
	Recipe.find({},function(err,foundRecipes){
		if (err) {
			console.log("error: "+err)
		} else {
			res.render("index.ejs",{recipes:foundRecipes})
		}
	})
})


app.get("/recipes/new", function(req,res){
	res.render("recipeNew.ejs");
})

app.post("/recipes", function(req,res){
	Recipe.create(req.body.recipe,function(err, createdRecipe){
		if (err) {
			console.log("err: "+err)
		} else {
			res.redirect("/recipes/"+createdRecipe._id)
		}
	})
})

app.get("/recipes/:id", function(req,res){
	Recipe.findById(req.params.id, function(err,foundRecipe){
		res.render("recipeShowDetails.ejs", {recipe:foundRecipe})
	})
})


app.listen(port, function(){
	console.log("Merchandiser App has started")
});