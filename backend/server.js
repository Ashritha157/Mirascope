const express = require("express");
const cors = require("cors");

const analyzeCsvRoute = require("./routes/analyzeCsv");

const app = express();
const PORT = 5000;

app.use(cors());

app.use("/analyze-csv", analyzeCsvRoute);

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
