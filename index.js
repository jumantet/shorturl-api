require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const uid2 = require("uid2");

const app = express();

app.use(cors());

app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const Url = mongoose.model("Url", {
  originalUrl: String,
  shortUrl: String,
  visits: Number
});

module.exports = Url;

//CREATE A SHORT URL

app.post("/create", async (req, res) => {
  try {
    const url = await Url.findOne({ originalUrl: req.body.url });
    if (!url) {
      const newUrl = new Url({
        originalUrl: req.body.url,
        shortUrl: uid2(5),
        visits: 0
      });
      await newUrl.save();
      res.json(newUrl);
    } else {
      res.status(400).json({ message: "This url has already been shortened" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ADD A VISIT EACH TIME A SHORTENED URL IS CLICKED

app.post("/visit", async (req, res) => {
  try {
    const url = await Url.findOne({ shortUrl: req.body.shortUrl });
    url.visits++;
    await url.save();
    res.json(url);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//READ ALL THE URLS SHORTENED

app.get("/urls", async (req, res) => {
  try {
    const urls = await Url.find();
    res.json(urls);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log("Serer has started");
});
