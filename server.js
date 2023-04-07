const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
console.log("Current Environment :", process.env.NODE_ENV);

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    // console.log(conn.connections);
    console.log("Connected with the DATABASE");
  });

app.listen(3000, "127.0.0.1", () => {
  console.log("Server Running on PORT 3000");
});
