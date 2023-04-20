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
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Server Running on PORT ${process.env.PORT || 3000}`);
    });
  });
