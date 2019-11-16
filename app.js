var express 	= require("express"),
app				= express(),
request 		=require("request"),
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
	ingredients: String,
	directions: String
})

var Recipe = mongoose.model("Recipe", recipeSchematic);




//=======================
//=== RESTFUL Routes=====
//=======================


//Index
app.get("/", function(req,res){
	res.redirect("/recipes");
})

//Index
app.get("/recipes", function(req,res){
	Recipe.find({},function(err,foundRecipes){
		if (err) {
			console.log("error: "+err)
		} else {
			res.render("index.ejs",{recipes:foundRecipes})
		}
	})
})

//New
app.get("/recipes/new", function(req,res){
	res.render("recipeNew.ejs");
})
app.get("/recipes/newLink", function(req,res){
	res.render("recipeNewLink.ejs");
})

//Create
app.post("/recipes", function(req,res){
	Recipe.create(req.body.recipe,function(err, createdRecipe){
		if (err) {
			console.log("err: "+err)
		} else {
			res.redirect("/recipes/"+createdRecipe._id)
		}
	})
})
app.get("/recipes/newLink/:url", function(req,res){
	var url = req.params.url;
	request(url,function(error,response,body){
		res.send(body);
	})
})

//Show
app.get("/recipes/:id", function(req,res){
	Recipe.findById(req.params.id, function(err,foundRecipe){
		res.render("recipeShowDetails.ejs", {recipe:foundRecipe})
	})
})

//Edit
app.get("/recipes/:id/edit", function(req,res){
	Recipe.findById(req.params.id, function(err,foundRecipe){
		if (err) {
			console.log("error: "+ err)
		} else{
			res.render("recipeEdit.ejs", {recipe:foundRecipe})
		}
	})
})

//Update
app.put("/recipes/:id", function(req,res){
	Recipe.findByIdAndUpdate(req.params.id, req.body.recipe, function(err,updatedRecipe){
		if (err) {
			console.log("err "+ err)
		} else {
			res.redirect("/recipes")
		}
	})
})

//Destroy
app.delete("/recipes/:id", function(req,res){
	Recipe.findByIdAndDelete(req.params.id, function(err, deletedRecipe){
		if (err) {
			console.log("err: "+ err)
		} else {
			console.log("successfully deleted: " +deletedRecipe.name + " with id of: "+deletedRecipe._id)
			res.redirect("/recipes")
		}
	})
})

app.listen(port, function(){
	console.log("Recipe Organizer App has started")
});