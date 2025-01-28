const express = require("express");

const app = express();
app.use(express.static("public"));
app.all("/level/edit", (req, res) => {
    res.sendFile(__dirname + "/public/level/edit/edit.html");
})
app.listen(8080);
