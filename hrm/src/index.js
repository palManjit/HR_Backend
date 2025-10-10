import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log("MongoDB conncted at port :: ", port);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed :: ", error);
  });
