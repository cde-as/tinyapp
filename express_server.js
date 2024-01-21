const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//------------------Our database of users--------------------
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@mail.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@mail.com",
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
randomString;

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {

  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  console.log("User: ", user); //********** returning Undefined********/
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // Checks if the user is already logged in
  // Only registered users can shorten URLs.
  if (!req.cookies['user_id']) {
    return res.status(403).send("Please login to shorten URLs.");
  } else {
    const longURL = req.body.longURL;
    const shortURL = generateRandomString(6);
    // Add the new URL entry to the database
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  }
});

// When we click: CREATE NEW URL
// (Only registered & logged in user can create tiny URLs.)

app.get("/urls/new", (req, res) => {
  // Checks if the user is already logged in, only registered users can shorten URLs.
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }
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


//Redirect Short URLs
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send(
    // Implement a relevant HTML error message if the id does not exist at GET /u/:id.
    // Handle the case where the short URL is not in the database
      "<html><head><title>Error</title></head><body><h1>Error</h1><p>URL Not Found</p></body></html>");
  }
});

//Delete URLs using DELETE button
app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.status(403).send("Please login to delete URLs.");
  }

  const shortURL = req.params.id;

  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(404).send("URL not found");
  }
});

//Edit URLs using EDIT button
app.post("/urls/:id/edit", (req, res) => {
  if (!req.cookies['user_id']) {
    return res.status(403).send("Please login to edit URLs.");
  }
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
  if (!req.cookies['user_id']) {
    return res.status(403).send("Please login to edit URLs.");
  }
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
  // Checks if the user is already logged in
  if (req.cookies['user_id']) {
    return res.redirect("/urls");
  }

  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let foundUser;
  let correctPassword;

  //Ensures that the email matches one from our database
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email && user.password === password) {
      correctPassword = user;
      foundUser = user;
      break;
    }
  }
  if (!foundUser || !correctPassword) {
    return res.status(403).send("Invalid email or password");
  }
 
  res.cookie('user_id', foundUser.id);
  res.redirect("/urls");
});

//When we click logout, it will clear the user ID cookie and return user to login page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  console.log("Logged out. Current users in database: ", users);
  res.redirect("/login");
});

// Returns the  CREATE REGISTRATION PAGE template we created
app.get("/register", (req, res) => {
  // Checks if the user is already logged in
  if (req.cookies['user_id']) {
    return res.redirect("/urls");
  }

  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString(6);

  if (!email || !password) {
    console.log(users);
    return res.status(403).send("Please provide an email and a password");
  }

  let foundUser;
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      foundUser = user;
    }
  }
  if (foundUser) {
    console.log(users);
    return res.status(403).send("A user with that email already exists");
  }

  const newUser = {
    id,
    email,
    password,
  };
  users[id] = newUser;
  console.log("Added new user into database: ", users);
  
  res.cookie("user_id", id);
  res.redirect("/urls");
});