//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true ,  useUnifiedTopology: true });
const itemSchema ={
  name: String
};
const Item=mongoose.model("item",itemSchema);
const item1= new Item({
  name:"welcome "
});
const item2= new Item({
  name:"welcome to here "
});
const item3= new Item({
  name:"hit the buttton "
});
const items = [item1,item2,item3];

const workItems = [];
const listSchema={
  name: String,
  itemes:[itemSchema]
}
const List = mongoose.model("list",listSchema);
app.get("/", function(req, res) {

Item.find({},function(err,founditems){
//here we check if there is no items then add the items that saved and redirect to home page again
  if(founditems.length === 0){
    Item.insertMany(items,function(err){
      if (err){
        console.log(err);
      }
      else{
        console.log("successfully added to DB");
      }
    });
    res.redirect("/");
  }else {
res.render("list", {listTitle: "today", newListItems: founditems});
}
});



});
//here we use route parameters to make person make a new list
app.get("/:customlistname",function(req,res){
const customlistname= _.capitalize(req.params.customlistname);
List.findOne({name:customlistname},function(err,foundlist){
  if(!err){
    if (!foundlist){
      //create a new list
      const list = new List({
        name: customlistname,
        itemes: items
      });
      list.save();
      res.redirect("/"+customlistname );
    }
    else{
      //display exist page
    res.render("list", {listTitle: foundlist.name, newListItems: foundlist.itemes});
    }
  }
})

});
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
const item= new Item({
  name: itemName
});
if (listName ==="today"){
item.save();
//save a new item in db then redirect to display
res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundlist){
    foundlist.itemes.push(item);
    foundlist.save();
    res.redirect("/"+ listName);
  })
}
});
app.post("/delete",function(req,res){
const checkeditemid = req.body.checkbox;
const listname = req.body.listname;
if(listname === "today"){
  Item.findByIdAndRemove(checkeditemid,function(err){
    if(!err){
      console.log("item deleted it ");
    res.redirect("/");
    }
  });
}else{
  List.findOneAndUpdate({name:listname},{$pull:{itemes: {_id:checkeditemid}}},function(err,foundlist){
    if(!err){
      res.redirect("/"+ listname);
    }
  });
}
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
