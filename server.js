const express = require("express");
const exphbs = require("express-handlebars");
const path = require("path");
const fs = require("fs");
const clientSessions = require("client-sessions");

const { connectDB, getGalleryCollection } = require("./db");
const galleryRouter = require("./galleryRouter");
const orderRouter = require("./orderRouter");

const app = express();
const PORT = process.env.PORT || 3000;

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "layout",
    partialsDir: path.join(__dirname, "views", "partials"),
    helpers: {
      filenameToLabel: function (fileName) {
        const dotIndex = fileName.lastIndexOf(".");
        if (dotIndex === -1) return fileName;
        return fileName.substring(0, dotIndex);
      }
    }
  })
);

app.set("view engine", "hbs");


app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: "session",
    secret: "web322_assignment3_secret_key",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
  })
);

const users = JSON.parse(
  fs.readFileSync(path.join(__dirname, "user.json"), "utf8")
);

app.get("/login", (req, res) => {
  res.render("login", { title: "Login Page" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!users[username]) {
    return res.render("login", {
      title: "Login Page",
      errorMsg: "Not a registered username"
    });
  }

  if (users[username] !== password) {
    return res.render("login", {
      title: "Login Page",
      errorMsg: "Invalid password"
    });
  }

  req.session.user = { username };

  const gallery = await getGalleryCollection();
  await gallery.updateMany({}, { $set: { status: "A" } });

  res.redirect("/");
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/login");
});

function ensureLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login");
  next();
}

app.use("/", ensureLogin, galleryRouter);
app.use("/order", ensureLogin, orderRouter);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

  module.exports = app;

