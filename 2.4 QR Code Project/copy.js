/* 
1. Use the inquirer npm package to get user input.
2. Use the qr-image npm package to turn the user entered URL into a QR code image.
3. Create a txt file to save the user input using the native fs node module.
*/

import inquirer from "inquirer";
import * as fs from "node:fs";
// var qr = require("qr-image");
import * as qr from "qr-image";
import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// var url_data="";

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/check", (req, res) => {
  // if (req.body["password"] === "ILoveProgramming") {
  //   res.sendFile(__dirname + "/public/secret.html");
  // } else {
  //   res.sendFile(__dirname + "/public/index.html");
  // }
  var user_url = req.body["url"];
  var file = req.body["file_name"];
  var txt_path = req.body["file_name"]+".txt";
  fs.writeFile(txt_path, user_url, (err) => {
    if (err) throw err;
    console.log("The File has been saved!");
  });
  var url_data = user_url;
  var qr_svg = qr.image(url_data, { type: "png" });
  // var png_path = png_name+".png";
  qr_svg.pipe(fs.createWriteStream(file+".png"));
  var svg_string = qr.imageSync(url_data, { type: "png" });
  res.sendFile(__dirname + "/public/index.html");
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const questions = [
  {
    type: "input",
    name: "url",
    message: "Please enter a url.",
  },
];

// inquirer.prompt(questions).then((answers) => {
//   var user_url = answers.url;
//   console.log(user_url);
//   fs.writeFile("user_url.txt", user_url, (err) => {
//     if (err) throw err;
//     console.log("The File has been saved!");
//   });
//   fs.readFile("user_url.txt", "utf8", (err, data) => {
//     var url_data = data;
//     qr_gen(url_data);
//   });
// });

// function qr_gen(url_data,png_name) {
//   //   var qr = require("qr-image");
//   // console.log(url_data);
//   var qr_svg = qr.image(url_data, { type: "png" });
//   // var png_path = png_name+".png";
//   qr_svg.pipe(fs.createWriteStream(png_name+".png"));
//   var svg_string = qr.imageSync(url_data, { type: "png" });
// }

