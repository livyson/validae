const express = require("express");
const dotenv = require("dotenv");
const createUser = require("./controllers/createUser");
const createValidationRequest = require("./controllers/createValidationRequest");
const login = require("./controllers/login");
const recoveryPassword = require("./controllers/recoveryPassword");
const newPassword = require("./controllers/newPassword");

const app = express();
app.use(express.json());
dotenv.config();

app.get("/health", (req, res) => {
  res.send("Hello, World");
});

app.use(createUser);
app.use(createValidationRequest);
app.use(login);
app.use(recoveryPassword);
app.use(newPassword);

app.listen(3001, () => {
  console.log("Listen - 3001");
});
