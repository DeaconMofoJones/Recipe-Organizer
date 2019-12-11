var express 	= require("express"),
app				= express(),
request 		=require("request"),
mongoose		= require("mongoose"),
methodOverride 	= require("method-override"),
bodyParser 		= require("body-parser"),
SavedRecipe		= require("./models/SavedRecipe.js"),
Recipe 			= require("./models/Recipe.js"),
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
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));








//=======================
//=== RESTFUL Routes=====
//=======================


//Index
app.get("/", function(req,res){
	res.redirect("/recipes");
})

//Index
app.get("/recipes", function(req,res){
	SavedRecipe.find({},function(err,foundRecipes){
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
app.get("/newLink", function(req,res){
	res.render("recipeNewLink.ejs");
})
app.get("/newSearch", function(req,res){
	res.render("recipeNewSearch.ejs");
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
app.post("/newLink", function(req,res){
	var url = req.body.recipe["link"]
	request(url,function(error,response,body){
		res.render("test.ejs",{body:body});
	})
})
app.post("/newSearch", function(req,res){
	var userSearch = req.body.recipe["search"];
	request("https://api.spoonacular.com/recipes/search?query="+userSearch+"&number=5&apiKey=6d53692bf5d14e8f93db61d833872edc", function(error,response,body){
		var data = JSON.parse(body);
		console.log(data);
		res.render("searchResults.ejs", {data:data});
	})
})
app.post("/saveRecipe/:id", function(req,res){
	var recipeID = req.params.id;
	request("https://api.spoonacular.com/recipes/"+ recipeID +"/information?includeNutrition=true&apiKey=6d53692bf5d14e8f93db61d833872edc", function(error,response,body){
		var data = JSON.parse(body);
		SavedRecipe.create(data,function(error,sRecipe){
			if (error) {
				console.log(error);
			} else {
				res.redirect("/recipes");
			}
		})
	});
})

//Show
app.get("/recipes/:id", function(req,res){
	SavedRecipe.findById(req.params.id, function(err,foundRecipe){
		console.log("found recipe: "+ foundRecipe)
		res.render("recipeShowDetails.ejs", {data:foundRecipe})
	})
})
app.get("/recipeSearch/:id", function(req,res){
	var recipeID = req.params.id;
	request("https://api.spoonacular.com/recipes/"+ recipeID +"/information?includeNutrition=true&apiKey=6d53692bf5d14e8f93db61d833872edc", function(error,response,body){
		var data = JSON.parse(body);
		res.render("recipeSearchShowDetails.ejs", {data:data});
	});
})

//Edit
app.get("/recipes/:id/edit", function(req,res){
	SavedRecipe.findById(req.params.id, function(err,foundRecipe){
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
	SavedRecipe.findByIdAndDelete(req.params.id, function(err, deletedRecipe){
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