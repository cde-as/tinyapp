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

// Export the function
module.exports = { getUserByEmail };