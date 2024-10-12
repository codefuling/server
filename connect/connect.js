import mongoose from "mongoose";
const connection_url = `mongodb://codefuling:1234@ac-5lgkwfr-shard-00-00.tydmd0u.mongodb.net:27017,ac-5lgkwfr-shard-00-01.tydmd0u.mongodb.net:27017,ac-5lgkwfr-shard-00-02.tydmd0u.mongodb.net:27017/?ssl=true&replicaSet=atlas-civzs2-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster-test`;

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