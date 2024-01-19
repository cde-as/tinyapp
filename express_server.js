const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Our database of users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "456",
  },
};
// -----------------Our database of links-------------------
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Creates our short URL string
const generateRandomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Uses the generateRandomString function to generate a random string length 6
const randomString = generateRandomString(6);
console.log(randomString);

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/* app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); */

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  console.log(user); //********** returning Undefined********/
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
 
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user,
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

//Delete URLs using delete button
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;

  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(404).send("URL not found");
  }
});

//Edit URLs using edit button
app.post("/urls/:id/edit", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (urlDatabase[shortURL]) {
    //Update the long URL in the database
    urlDatabase[shortURL] = newLongURL;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(404).send("URL not found");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user,
  };
  res.render("urls_show", templateVars); //************************** */
});

app.get("/urls/:id/edit", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
  };
  res.render("urls_show", templateVars);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  let foundUser;
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      foundUser = user;
      break;
    }
  }
  if (!foundUser) {
    return res.status(400).send("invalid email or password");
  }
  res.cookie('user_id', foundUser.id);
  //redirect to /urls page.
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// Returns the  CREATE REGISTRATION PAGE template we created
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const id = generateRandomString(6);

  if (!email || !password) {
    return res.status(400).send("Please provide an email and a password");
  }

  let foundUser;
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      foundUser = user;
    }
  }
  if (foundUser) {
    return res.status(400).send("A user with that email already exists");
  }

  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;
  console.log(newUser);
  console.log(users);

  res.cookie("user_id", id);
  res.redirect("/urls");
});
