const express = require("express");
const cors = require("cors");
const path = require('path');
const app = express();
var corsOptions = {
    origin: "http://localhost:3000"
  };


app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: "Welcome to agricom." });
  });
  const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

app.use(express.static(path.join(__dirname, 'uploads')));
app.get('/uploads/:id', (req, res) => {
  res.sendFile(path.join(__dirname, `./uploads/${req.params.id}`));
});

const db = require("./app/models");
const dbConfig = require("./app/config/db.config");
const Role = db.role;
db.mongoose.set("strictQuery", false);
db.mongoose .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

  function initial() {
  Role.count((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
require('./app/routes/user.routes')(app);
require('./app/routes/auth.routes')(app);
