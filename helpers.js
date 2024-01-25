const getUserByEmail = function(email, database) {
  // To avoid duplication of user emails
  for (const userID in database) {
    const user = database[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null; // If user is not found
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


// Export the function
module.exports = {
  getUserByEmail,
  generateRandomString,
  randomString
};