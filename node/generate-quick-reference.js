const path = require('path');
const fs = require('fs');
const utB = require("./util-book-reference");

const my_path = path.join("../data/generated", "bookref-quick.json");
fs.writeFileSync(my_path, JSON.stringify(utB.UtilBookReference.getIndex({name: "快速参照", id: "bookref-quick", tag: "quickref"})).replace(/\s*\u2014\s*?/g, "\\u2014"), "utf8");
console.log("Updated Quick references.");
