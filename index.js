// Importera och skapa en Express-app
let express = require("express");
let app = express();

// Använda body-parser för att tolka inkommande begäranden och fs för filhantering
let bodyParser = require("body-parser");
let fs = require("fs");

// Här är localhost nr alltså servern
let PORT = 9604;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Lägga in body-parser för att tolka URL-kodade data och använda statiska filer i mappen "public"
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Här skapar jag en array för att lagra inlägg
let posts = [];

// Den ska försöka läsa data från "posts.json" vid start av servern
try {
  let data = fs.readFileSync("posts.json", "utf8");
  if (data) {
    posts = JSON.parse(data);
  }
} catch (err) {
  console.error("Fel vid läsning av filen:", err);
}
// Sköta GET-begäran för rotvägen ("/")
app.get("/", (req, res) => {
  let output = "";

// Skapa HTML-utdata för varje inlägg om det finns inlägg i arrayen "posts"
  if (posts && posts.length > 0) {
  for (let i = posts.length - 1; i >= 0; i--) {
// Formatera tiden för varje inlägg
let formattedTime = new Date(posts[i].Time).toLocaleString('sv-SE', {
year: 'numeric',
month: '2-digit',
day: '2-digit',
hour: '2-digit',
minute: '2-digit'
});

// Skapa HTML för varje inlägg baserat på dess information
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

// Läs innehållet från "index.html" och byt ut platsmarkeringen "GÄSTER" med genererat HTML-utdata
let html = fs.readFileSync(__dirname + "/index.html").toString();
html = html.replace("GÄSTER", output);
res.send(html);
});


// Hantera POST-begäran för att hantera inkommande inlägg från formuläret ("/submit")
app.post("/submit", (req, res) => {
// Hämta data från formuläret
let { Name, Email, From, Tel, Comment } = req.body;
let currentTime = new Date().toISOString();
posts.push({ Name, Email, Time: currentTime, From, Tel, Comment });

// Här lägger man till det nya inlägget i arrayen och läggs in i "posts.json"-filen
fs.writeFile("posts.json", JSON.stringify(posts), (err) => {
    if (err) {
      console.error("Fel vid skrivning till filen:", err);
      return res.status(500).send("Serverfel");
    }
    res.redirect("/");
  });
});

// Hantera GET-begäran för att hämta alla inlägg ("/posts")
app.get("/posts", (req, res) => {
  res.json(posts);
});

