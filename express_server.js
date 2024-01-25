const express = require("express");
const helpers = require("./helpers"); // Require the helpers module
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080; // default port
const bcrypt = require("bcryptjs");
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['chris-secret-word'],

  maxAge: 24 * 60 * 60 * 1000 // Expiration: 24 hours
}));

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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};

const urlsForUser = (id) => {
  // Returns the URLs where the userID is equal to the id of the currently logged-in user.
  if (!id || !users[id]) {
    return;
  }
  //Filter urlDatabase so that only the user logged in will see the URLs they made.
  const userURLs = {};
  //For every short URL in our database, does it belong to our logged in user
  for (const shortURL in urlDatabase) {
    //in our urlDatabase object access the user ID, if it matches the user currently logged on then show their URL.
    if (urlDatabase[shortURL].userID === id) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

app.get("/", (req, res) => {
  const userId = req.ression.userId;
  
  if (userId) {
  //If the user is logged in redirect to /urls
    res.redirect("/urls");
  } else {
  // If the user is not logged in redirect to /login
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];

  //Checks if user is not logged in. If not, will send error message
  if (!user) {
    return res
      .status(403)
      .send(
        "<html><head> <title>Error</title> </head><body> <h1>Error</h1> <p>Please log in or register first.</p> </body></html>"
      );
  }

  const userURLs = urlsForUser(userId);

  // Updated templateVars so that our urlsForUser function is used
  const templateVars = {
    urls: userURLs,
    user: user,
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  //For adding a new URL to the database
  // Checks if the user is already logged in
  // Only registered users can shorten URLs.
  if (!req.session.userId) {
    return res.status(403).send("Please login to shorten URLs.");
  } else {
    const userId = req.session.userId;
    //const user = userId;

    const longURL = req.body.longURL;
    const shortURL = helpers.generateRandomString(6);

    // Updated - How to add a new URL entry to the database
    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: userId,
    };

    /*  const templateVars = {
      urls: urlDatabase,
      user: userId,
    }; */
    //res.render("urls_new", templateVars);
    res.redirect(`/urls/${shortURL}`);
  }
});


app.get("/urls/new", (req, res) => {
  // When we click: CREATE NEW URL
  // Checks if the user is already logged in, only registered users can shorten URLs.
  if (!req.session.userId) {
    res.redirect("/login");
  }
  // user info
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = {
    urls: urlDatabase,
    user: user,
  };
  res.render("urls_new", templateVars);
});


app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const shortURL = req.params.id;

  // If user is not logged in send error
  if (!user) {
    return res
      .status(401)
      .send(
        "<html> <head> <title>Error</title> </head><body> <h1>Error</h1> <p> Please log in or register. </p></body></html>"
      );
  }
  // If user does not own the URL send error (line 105)
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID !== userId) {
    return res
      .status(403)
      .send(
        "<html> <head> <title>Error</title> </head><body> <h1>Error</h1> <p> You do not own this URL. </p></body></html>"
      );
  }
  //If the URL does not exist
  if (!urlDatabase[shortURL]) {
    return res
      .status(404)
      .send("<html> <head> <title>Error</title> </head><body> <h1>Error</h1> <p> This URL does not exist. </p></body></html>");
  }
  

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL, //refactored so that we are accessing longURL by adding .longURL
    user: user,
  };
  res.render("urls_show", templateVars);
});

// GET / U:ID
app.get("/u/:id", (req, res) => {
  //Redirect to Short URLs
  //const userId = req.cookies['userId'];
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;



  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send(
      // Implement a relevant HTML error message if the id does not exist at GET /u/:id.
      // Handle the case where the short URL is not in the database
      "<html><head> <title>Error</title> </head> <body> <h1>Error</h1> <p>URL Not Found</p> </body></html>"
    );
  }
});

// POST URL DELETE
app.post("/urls/:id/delete", (req, res) => {
  //Delete URLs using DELETE button
  const shortURL = req.params.id;

  if (!shortURL) {
    res.status(404).send(
      // Implement a relevant HTML error message if the id does not exist at GET /u/:id.
      // Handle the case where the short URL is not in the database
      "<html><head> <title>Error</title> </head> <body> <h1>Error</h1> <p>ID Does Not Exist</p> </body></html>"
    );
  }
  
  if (!req.session.userId) {
    return res.status(403).send("Please login to delete URLs.");
  }
  if (urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect(`/urls`);
  } else {
    res.status(404).send("URL not found");
  }
});

//POST / URLS EDIT
app.post("/urls/:id/edit", (req, res) => {
  //Edit URLs using EDIT button
  if (!req.session.userId) {
    //Checks if there is a user session
    return res.status(403).send("Please login to edit URLs.");
  }
  const userId = req.session.userId;
  const user = users[userId];

  const shortURL = req.params.id;
  const newLongURL = req.body.newLongURL;

  if (urlDatabase[shortURL]) {
    //Update the long URL in the database
    urlDatabase[shortURL].longURL = newLongURL;
    res.redirect(`/urls`);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/urls/:id/edit", (req, res) => {
  if (!req.session.userId) {
    return res.status(403).send("Please login to edit URLs.");
  }
  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user,
  };
  res.render("urls_show", templateVars);
});

// GET / Login
app.get("/login", (req, res) => {
  // Checks if the user is already logged in
  if (req.session.userId) {
    return res.redirect("/urls");
  }

  const userId = req.session.userId;
  const user = users[userId];

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user,
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //Ensures the email matches one from our database,
  const foundUser = helpers.getUserByEmail(email, users);
   
  if (!foundUser || !bcrypt.compareSync(password, foundUser.hashedPassword)) {
    console.log("Invalid login attempt");
    return res.status(403).send("Invalid email or password");
  }
  console.log("Login successful. User ID:", foundUser.id);

  req.session.userId = foundUser.id; //update to cookie session
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  //When we click logout, it will clear the user ID cookie and return user to login page
  req.session = null; //Clear the session cookie
  console.log("Logged out. Current users in database: ", users);
  res.redirect("/login");
});

// GET / REGISTER
app.get("/register", (req, res) => {
  // Returns the  CREATE REGISTRATION PAGE template we created
  // Checks if the user is already logged in
  if (req.session.userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: null,
  };
  res.render("register", templateVars);
});

// POST / REGISTER
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log("hashed pass: ", hashedPassword);
  const id = helpers.generateRandomString(6);

  if (!email || !password) {
    console.log(users);
    return res.status(403).send("Please provide an email and a password");
  }

  const foundUser = helpers.getUserByEmail(email, users);

  if (foundUser) {
    console.log(users);
    return res.status(403).send("A user with that email already exists");
  }

  const newUser = {
    id,
    email,
    hashedPassword,
  };
  users[id] = newUser;
  console.log("Added new user into database: ", users);
 

  req.session.userId = id; //set userId in the session
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});