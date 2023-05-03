const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const app = require("./app");
console.log("Current Environment :", process.env.NODE_ENV);
process.env.gateOpen = 0;

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((conn) => {
    // console.log(conn.connections);
    console.log("Connected with the DATABASE");
    const port = process.env.PORT || 5050;
    app.listen(port, () => {
      console.log(`Server Running on PORT ${port}`);
    });
  });
