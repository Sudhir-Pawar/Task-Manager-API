const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  (err) => {
    !err
      ? console.log("Connected to MongoDB")
      : console.log("MongoDB Error: " + err);
  }
);
