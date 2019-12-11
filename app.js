var express 	= require("express"),
app				= express(),
request 		=require("request"),
bodyParser 		= require("body-parser"),
mongoose		= require("mongoose"),
methodOverride 	= require("method-override"),
SavedRecipe		= require("./models/SavedRecipe.js"),
Recipe 			= require("./models/Recipe.js"),
passport 		= require("passport"),
port			= process.env.PORT || 3000,
LocalStrategy 	= require("passport-local"),
User 			= require("./models/User.js"),
passportLocalMongoose = require("passport-local-mongoose"),
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

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.use(require("express-session")({
	secret:"auquafina block",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());



passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());










//=======================
//=== RESTFUL Routes=====
//=======================


//Index
app.get("/", isLoggedIn ,function(req,res){
	res.render("home");
})

//Index
app.get("/recipes", isLoggedIn ,function(req,res){
	SavedRecipe.find({},function(err,foundRecipes){
		if (err) {
			console.log("error: "+err)
		} else {
			res.render("index.ejs",{recipes:foundRecipes})
		}
	})
})

//New
app.get("/recipes/new", isLoggedIn ,function(req,res){
	res.render("recipeNew.ejs");
})
app.get("/newLink", function(req,res){
	res.render("recipeNewLink.ejs");
})
app.get("/newSearch", function(req,res){
	res.render("recipeNewSearch.ejs");
})

//Create
app.post("/recipes", isLoggedIn ,function(req,res){
	Recipe.create(req.body.recipe,function(err, createdRecipe){
		if (err) {
			console.log("err: "+err)
		} else {
			res.redirect("/recipes/"+createdRecipe._id)
		}
	})
})
app.post("/newLink", isLoggedIn ,function(req,res){
	var url = req.body.recipe["link"]
	request(url,function(error,response,body){
		res.render("test.ejs",{body:body});
	})
})
app.post("/newSearch", isLoggedIn ,function(req,res){
	var userSearch = req.body.recipe["search"];
	request("https://api.spoonacular.com/recipes/search?query="+userSearch+"&number=5&apiKey=6d53692bf5d14e8f93db61d833872edc", function(error,response,body){
		var data = JSON.parse(body);
		console.log(data);
		res.render("searchResults.ejs", {data:data});
	})
})
app.post("/saveRecipe/:id", isLoggedIn ,function(req,res){
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
app.get("/recipes/:id", isLoggedIn ,function(req,res){
	SavedRecipe.findById(req.params.id, function(err,foundRecipe){
		console.log("found recipe: "+ foundRecipe)
		res.render("recipeShowDetails.ejs", {data:foundRecipe})
	})
})
app.get("/recipeSearch/:id", isLoggedIn ,function(req,res){
	var recipeID = req.params.id;
	request("https://api.spoonacular.com/recipes/"+ recipeID +"/information?includeNutrition=true&apiKey=6d53692bf5d14e8f93db61d833872edc", function(error,response,body){
		var data = JSON.parse(body);
		res.render("recipeSearchShowDetails.ejs", {data:data});
	});
})

//Edit
app.get("/recipes/:id/edit", isLoggedIn ,function(req,res){
	SavedRecipe.findById(req.params.id, function(err,foundRecipe){
		if (err) {
			console.log("error: "+ err)
		} else{
			res.render("recipeEdit.ejs", {recipe:foundRecipe})
		}
	})
})

//Update
app.put("/recipes/:id", isLoggedIn ,function(req,res){
	Recipe.findByIdAndUpdate(req.params.id, req.body.recipe, function(err,updatedRecipe){
		if (err) {
			console.log("err "+ err)
		} else {
			res.redirect("/recipes")
		}
	})
})

//Destroy
app.delete("/recipes/:id", isLoggedIn ,function(req,res){
	SavedRecipe.findByIdAndDelete(req.params.id, function(err, deletedRecipe){
		if (err) {
			console.log("err: "+ err)
		} else {
			console.log("successfully deleted: " +deletedRecipe.name + " with id of: "+deletedRecipe._id)
			res.redirect("/recipes")
		}
	})
})

//============================================
//				User Auth Routes
//============================================

//==================
//Register Routes
//==================

//register form
app.get("/register", function(req,res){
	res.render("register");
})

//handle user sign up
app.post("/register", function(req,res){
	//.register hashes the password, then the callback function returns the new user with the hashed password
	//VERY IMPORTANT:
	//Never save password using new User({}).
	//Notice how the password is passed into the .register method as a second argument. This is the safe way to do it. It automatically hashes and salts the password, making it exponentially more secure then just saving the raw password to the User object in the database.
	User.register(new User({username:req.body.username}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.send(err);
		}
		//if the user is created, then log the saved user in to a session
		passport.authenticate("local")(req, res, function(){
			res.redirect("/");
		})
	})
})

//==================
//Login Routes
//==================

//show login form
app.get("/login", function(req,res){
	res.render("login");
})

//handle login
app.post("/login", passport.authenticate("local",
	{
		successRedirect: "/",
		failureRedirect: "/login",
	}) , function(req,res){

})

//==================
//	Logout
//==================

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/login");
})

//==================
//	Check Logged In
//==================
function isLoggedIn(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	} else {
		res.redirect("/login");	
	}
	
}

app.listen(port, function(){
	console.log("Recipe Organizer App has started")
});