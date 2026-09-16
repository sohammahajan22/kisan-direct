const jwt = require("jsonwebtoken");

// Ye function login ke time ek "token" banata hai jisme user ki id aur role chhupi hoti hai
function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// Ye function check karta hai ki token asli/valid hai ya nahi
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyToken };