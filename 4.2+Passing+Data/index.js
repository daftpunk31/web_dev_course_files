import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

var fname="";
var lname = "";

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const data1={
    title:"<h1>Enter your name below &#128071 </h1>",
  };
  res.render("index.ejs", data1);
});

app.post("/submit", (req, res) => {
    fname = req.body["fName"];
    lname = req.body["lName"];
    var count = (fname+lname).length;
    const data2={
      title:"There are "+count.toString()+" letters in your name.",
    };
    res.render("index.ejs", data2)
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
