const express = require("express");

const PORT = process.env.PORT || 5102;

const app = express();

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});