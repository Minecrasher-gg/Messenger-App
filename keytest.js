const fs = require("fs");

// Check if the file is loading
console.log(fs.readFileSync("./firebaseKey.json", "utf8"));