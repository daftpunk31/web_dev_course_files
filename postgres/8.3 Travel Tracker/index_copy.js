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
    try{
      if(duplicate_countries.length === 1){
        //Checking if the country is already visited or not.
        try{
          const new_data = result.rows[0];
          const new_country_code = new_data.country_code;
          //Checking if the country_code already exists in the visited_countries table.
          const checkCountry = await db.query(`SELECT country_code FROM visited_countries WHERE country_code='${new_country_code}'`);
        }
        //If the user has already visited the country, sending a message.
        catch(err){
          console.log(err);
          const countries = await checkVisited();
          let msg = "Hey! You already visited that country!";
          res.render("index.ejs",{error:msg,countries: countries, total: countries.length});
        }
        //Inserting the country into the visited_countries table if not already present.
        try{
          db.query(`INSERT INTO visited_countries (country_code) VALUES ('${input}')`);
          res.redirect("/");
        }
        //Catching the error if there is any issue with inserting the new country_code into the visited_countries table.
        catch(err){
          console.log(err);
          const countries = await checkVisited();
          let msg = "Error adding country to visited countries!";
          res.render("index.ejs",{error:msg,countries: countries, total: countries.length});
        }
      }
      else{
      throw new Error(`Multiple countries with the name '${input}' exist!`);
      }
    }
    //Catching the error if there are multiple countries with similar name.
    catch(err){
      //Sending the user a message regarding multiple countries with similar names.
      console.log(err);
      const countries = await checkVisited();
      let msg = "Did you mean: "+ duplicate_countries.join(' or ')+"?";
      res.render("index.ejs",{error:msg, countries: countries, total: countries.length});
      //Taking new input from the user.
      try{
        const new_input = req.body["country"];
        const result = await db.query(`SELECT country_code FROM countries WHERE country_name='${new_input}' `);
        const new_data = result.rows[0];
        const final_country_code = new_data.country_code;

        // console.log(new_input);
        db.query(`INSERT INTO visited_countries (country_code) VALUES ('${final_country_code}')`);
        res.redirect("/");
      }
      catch(err){
        console.log(err);
        const countries = await checkVisited();
        let msg = "Cannot add the country. Please refresh the page.";
        res.render("index.ejs",{error:msg, countries: countries, total: countries.length});
      }
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