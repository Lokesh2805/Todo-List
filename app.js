//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
//let listitems =["bring food","cook food","eat food"];
//let workitems = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

mongoose.connect("mongodb+srv://rejeevseth19712:lokesh28@cluster0.pr4o6nx.mongodb.net/todolistDB");



const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const  item1 = new Item({
  name:"Welcome to your to dolist!"
});
 
const  item2 = new Item({
  name:"Press + to add new item to list."
});

const  item3 = new Item({
  name:"Press checkbox to delete any item from list."
});

const defaultarray = [item1, item2, item3];

const listschema ={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listschema);
 
app.get("/", function(req, res){

/*let today = new Date();
let options = {
  weekday: "long",
  day: "numeric",
  month: "long"
};
let day = today.toLocaleDateString("en-US",options);*/

Item.find({}).then((founditems) => {

  if(founditems.length === 0){
    Item.insertMany(defaultarray).then(() => {
   console.log('Default items displayed');
    }).catch((err) => {
      console.error('Failed', err);
    });
  }else{
  res.render("list",{listtitle : "Today", newitemaddedlist: founditems});
}});


});

app.get("/:customlistname", function(req,res){
  const customlistname = _.capitalize(req.params.customlistname);

  List.findOne({name:customlistname}).then((foundlist) => {
    if(!foundlist){
      //create a new list
      const list = new List({
        name: customlistname,
        items: defaultarray
      });
    list.save(); 
    res.redirect("/" + customlistname);
    }else{
      //display exsisting list
      
    res.render("list",{listtitle : foundlist.name, newitemaddedlist: foundlist.items});
    }


  }).catch((err) => {
    console.error('Failed', err);
  });

});

app.post("/", function(req, res){
//   let item = req.body.newitem;
//  if(req.body.list === "work"){
//   workitems.push(item);
//   res.redirect("/work");
//  }
//  else{
//   listitems.push(item);
// res.redirect("/");
// }

const itemname = req.body.newitem;
const listname = req.body.list;
const item = new Item({
  name: itemname
});

if(listname === "Today"){
  item.save(); 
  res.redirect("/");
}else{
  List.findOne({name:listname}).then((foundlist)=>{
    foundlist.items.push(item);
    foundlist.save();
    res.redirect("/" + listname);
});
}



});
app.post("/delete", function(req,res){
 const checkeditemid = req.body.checkbox;
 const listname = req.body.listname;
 if( listname === "Today"){
  Item.findByIdAndDelete(checkeditemid).then(() => {
    console.log('items deleted successfully');
    res.redirect("/");
  }).catch((err) => {
    console.error('Failed', err);
  });
 }else{
  List.findOneAndUpdate({name: listname}, {$pull:{items:{_id:checkeditemid}}}).then((foundlist)=>{
    res.redirect("/" + listname);

  })
 }
 
});

// app.get("/work", function(req,res){
//   res.render("list",{listtitle : "Work List", newitemaddedlist: workitems});
// })

app.post("/work", function(req, res){
  let item = req.body.newitem;
   workitems.push(item);
 res.redirect("/work");
 })

app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
