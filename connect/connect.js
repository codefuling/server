import mongoose from "mongoose";
const connection_url = `mongodb+srv://codefuling:1234@cluster-test.tydmd0u.mongodb.net/`;

const connect = () => {
  if (process.env.NODE_ENV !== "production") {
    mongoose.set("debug", true);
  }

  mongoose
      .connect(connection_url, {
          dbName: "express",
      })
      .then(() => {
          console.log("Connected to MongoDB");
      })
      .catch((err) => {
          console.error("Connected fail to MongoDB");
          console.log(err);
      });
  }
export default connect;