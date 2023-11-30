let express = require("express");
let app = express();
let bodyParser = require("body-parser");
let fs = require("fs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let posts = [];

try {
  let data = fs.readFileSync("posts.json", "utf8");
  if (data) {
    posts = JSON.parse(data);
  }
} catch (err) {
  console.error("Fel vid läsning av filen:", err);
}

app.get("/", (req, res) => {
  let output = "";
  if (posts && posts.length > 0) {
    for (let i = posts.length - 1; i >= 0; i--) {
      let formattedTime = new Date(posts[i].Time).toLocaleString('sv-SE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });

      output += `
        <p>
          <b>Time:</b> ${formattedTime}<br>
          <b>From:</b> ${posts[i].From}<br>
          <b>Email:</b> ${posts[i].Email}<br>
          <b>Tel:</b> ${posts[i].Tel}<br>
          <b>Comment:</b><br>${posts[i].Comment}
        </p>
      `;
    }
  }
  let html = fs.readFileSync(__dirname + "/index.html").toString();
  html = html.replace("GÄSTER", output);
  res.send(html);
});

app.post("/submit", (req, res) => {
  let { Name, Email, From, Tel, Comment } = req.body;
  let currentTime = new Date().toISOString();
  posts.push({ Name, Email, Time: currentTime, From, Tel, Comment });

  fs.writeFile("posts.json", JSON.stringify(posts), (err) => {
    if (err) {
      console.error("Fel vid skrivning till filen:", err);
      return res.status(500).send("Serverfel");
    }
    res.redirect("/");
  });
});

app.get("/posts", (req, res) => {
  res.json(posts);
});

let PORT = 9604;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
