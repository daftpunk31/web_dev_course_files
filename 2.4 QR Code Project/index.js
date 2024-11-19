import inquirer from "inquirer";
import * as fs from "node:fs";
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
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/check", (req, res) => {
  console.log("Received request body:", req.body);

  const user_url = req.body["url"];
  const file = req.body["file_name"];

  if (!user_url || !file) {
    res.status(400).send("Bad Request: Missing url or file_name");
    return;
  }

  const txt_path = file + ".txt";
  const png_path = file + ".png";

  // Write the URL to a text file
  fs.writeFile(txt_path, user_url, (err) => {
    if (err) {
      console.error("Error writing text file:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    console.log("Text file has been saved!");

    // Generate the QR code and save it as a PNG
    const qr_svg = qr.image(user_url, { type: "png" });
    const writeStream = fs.createWriteStream(png_path);
    qr_svg.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log("QR code PNG has been saved!");

      // Respond with links to download the files
      res.json({
        txt: `/download?file=${txt_path}`,
        png: `/download?file=${png_path}`
      });
    });

    writeStream.on('error', (err) => {
      console.error("Error writing PNG file:", err);
      res.status(500).send("Internal Server Error");
    });
  });
});

app.get('/download', (req, res) => {
  const file = req.query.file;
  res.download(file, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    // Cleanup: remove the file after download
    fs.unlink(file, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });
  });
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

