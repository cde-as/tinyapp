const { assert } = require("chai");

const { getUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    const userEmail = "user@example.com";

    // Write your assert statements here
    // Assert that the returned user's ID matches the expected user ID
    assert.equal(user.id, expectedUserID,
      "User ID should match the right user ID");

    // Assert that the returned user's email matches the input email
    assert.equal(
      user.email,
      userEmail,
      "User email should match the input email"
    );
  });

  it('should return null for a non-existent email', function() {
    const nonExistentEmail = "doesnotexist@example.com";
    const user = getUserByEmail(nonExistentEmail, testUsers);

    // Assert that the returned user is null for a non-existent email
    assert.isNull(user, 'User should be null for a non-existent email');
  });

});
