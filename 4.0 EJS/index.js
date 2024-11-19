import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.set('view engine', 'ejs')

const greetings ={
  weekday: "Hey! It's a weekday, it's time to work hard!",
  weekend: "Hey! It's the weekend, it's time to have fun!",
}

let date = new Date();
var day = date.getDay();


app.get("/",(req, res)=>{
  if((day===0)||(day===6)){
    res.render("index.ejs",{
      data: greetings.weekend
    })
  }
  else{
    res.render("index.ejs",{
      data: greetings.weekday
    })
  }
});

app.listen(port, () => {
  console.log(`App listening at port ${port}`)
})
