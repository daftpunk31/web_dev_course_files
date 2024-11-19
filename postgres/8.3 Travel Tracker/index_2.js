import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "@Datais9ice",
  port: 5432,
});

db.connect();

async function checkVisited(){
  let countries=[];
  let result = await db.query("SELECT country_code from visited_countries");
  result.rows.forEach((country)=>{
  countries.push(country.country_code);
  });
  return countries;
}

async function addCountry(country_code){
  db.query(`INSERT INTO visited_countries (country_code) VALUES ('${country_code}')`);
}

app.get("/", async (req, res) => {
  //Write your code here.
  let countries = await checkVisited();
  res.render("index.ejs",{countries: countries, total: countries.length});
});


app.post("/add", async (req, res) => {
  //Taking input from the user.
  let input = req.body["country"];
  let duplicate_countries = [];

  //Checking if the country (input) or a similar country exists in the world or not.
  try{
    if(input.length!=0){
      const result = await db.query(`SELECT country_code,country_name FROM countries WHERE country_name ILIKE '%${input}%'`);
      // console.log(result.rows[0]);
      result.rows.forEach((country)=>{
        duplicate_countries.push(country.country_name);
      });
      //Checking if there are any countries with the same name, if not, proceeding to check if the user has already visited the country.
      
      if(duplicate_countries.length > 1){
        const countries = await checkVisited();
        let msg = "Did you mean: "+ duplicate_countries.join(' or ')+"?";
        res.render("index.ejs",{error:msg, countries: countries, total: countries.length});
        return;
      }
      else if(duplicate_countries.length == 1){
        // console.log(duplicate_countries[0]);
        //Getting the country_code of the input country name.
        let input = req.body["country"];
        const result = await db.query(`SELECT country_code FROM countries WHERE country_name='${input}'`);
        const data = result.rows[0];
        const countryCode = data.country_code;
        //Checking if the user has already visited the country.
        const resultInsert = await db.query(`SELECT country_code FROM visited_countries WHERE country_code='${countryCode}'`);
        if(resultInsert.rows.length > 0){
          const countries = await checkVisited();
          let msg = "Hey! You already visited that country!";
          res.render("index.ejs",{error:msg,countries: countries, total: countries.length});
          return;
        }
        //Inserting the country_code into the visited_countries table if country not visited.
        try{
          db.query(`INSERT INTO visited_countries (country_code) VALUES ('${countryCode}')`);
          res.redirect("/");
        }
        //Catching the error if there is any issue with inserting the new country_code into the visited_countries table.
        catch(err){
          console.log(err);
          const countries = await checkVisited();
          let msg = "Error inserting country to visited countries!";
          res.render("index.ejs",{error:msg,countries: countries, total: countries.length});
        }
        return;
      }
    }
    else{
      throw new Error(`You cannot add an empty country!`);
    }
  }
  //Catching the country not found error.
  catch(err){
    console.log(err);
    const countries = await checkVisited();
    let msg = "This country name does not exist! Please recheck your input.";
    res.render("index.ejs",{error:msg,countries: countries, total: countries.length});
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});