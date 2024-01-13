const express = require("express");
const app = express();
const PORT = 8080; // default port

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

//Creates our short URL string
const generateRandomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
// Using the function to generate a random string of length 6
const randomString = generateRandomString(6);
console.log(randomString);

//Our database of links
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

/* app.get("/", (req, res) => {
  res.send("Hello!");
}); */

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/* app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
}); */

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6);

  // Add the new URL entry to the database
  urlDatabase[shortURL] = longURL;

  //redirect after form submission
  res.redirect(`/urls/${shortURL}`);
});

//Redirect Short URLs
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found"); // Handle the case where the short URL is not in the database
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(404).send("URL not found");
  }
 
});