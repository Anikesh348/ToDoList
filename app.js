const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://anikesh_3:Test123@cluster0-xieap.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true })
const itemsSchema = {
    name: String
}
const Item = mongoose.model("item", itemsSchema)

const item1 = new Item({
    name: "Welcome to your todolist"
})
const item2 = new Item({
    name: "Add items using the + button"
})
const item3 = new Item({
    name: "Strike the items using the checkbox"
})

const defaultArray = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemsSchema]
}
const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {
    Item.find({}, function(err, itementry) {
        if (err) console.log("Somethin wrong!!")
        else {
            if (itementry.length === 0) {
                Item.insertMany(defaultArray, function(err) {
                    if (err) console.log("Somethin' wrong!!")
                    else console.log("default items succesfully added to the data base")
                })
                //res.redirect("/")
            }

        }
        const day = date.getDate();

        res.render("list", { listTitle: day, newListItems: itementry });
    })



});
app.get("/:listName", function(req, res) {
    const customListName = _.capitalize(req.params.listName)


    List.findOne({ name: customListName }, function(err, found) {
        if (!err) {
            if (!found) {
                const list = new List({
                    name: customListName,
                    items: defaultArray
                })
                list.save()
                res.redirect("/" + customListName)
            } else
                res.render("list", { listTitle: found.name, newListItems: found.items });
        }
    })

})

app.post("/", function(req, res) {
    const itemdata = new Item({
        name: req.body.newItem
    })
    let listname = req.body.list
    if (listname === date.getDate()) {
        itemdata.save();
        res.redirect("/");
    } else {
        List.findOne({ name: listname }, function(err, found) {
            found.items.push(itemdata)
            found.save();
            res.redirect("/" + listname)
        })

    }
});

app.post("/delete", function(req, res) {
    if (req.body.listNName === date.getDate()) {
        Item.findByIdAndRemove(req.body.checked, function(err) {
            if (err) console.log("Somethin is wrong")
            else {
                console.log("Items removed");
                res.redirect("/")

            }
        })
    } else {


        // using mongoose for finding the list and then using mongodb $pull function to delete the checked array 
        List.findOneAndUpdate({ name: req.body.listNName }, { $pull: { items: { _id: req.body.checked } } }, function(err, found) {
            if (!err) {
                res.redirect("/" + found.name)
            }
        })
    }
})


app.get("/about", function(req, res) {
    res.render("about");
});

app.listen(process.env.PORT || 8100, function() {
    console.log("Readyy!!");
});