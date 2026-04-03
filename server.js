require("dotenv").config();
const app = require("./app");
const connectDB = require("./helper/db");

const PORT = process.env.PORT || 3000;

// DB connect first
connectDB();

// Then server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
