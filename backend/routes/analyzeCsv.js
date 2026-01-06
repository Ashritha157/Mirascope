const express = require("express");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const vader = require("vader-sentiment");

const { extractThemesTFIDF } = require("../services/themeService");
const { normalizeRating } = require("../services/ratingService");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/", upload.single("file"), (req, res) => {
  let total = 0;
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let ratingSum = 0;

  let ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let openResponses = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      total++;

      const feedback = row.feedback;
      const rating = normalizeRating(row.rating);

      if (rating) {
        ratingSum += rating;
        ratingDistribution[rating]++;
      }

      if (feedback && feedback.trim() !== "") {
        const score =
          vader.SentimentIntensityAnalyzer.polarity_scores(feedback).compound;

        if (score > 0.05) positive++;
        else if (score < -0.05) negative++;
        else neutral++;

        openResponses.push(feedback);
      }
    })
    .on("end", () => {
      fs.unlinkSync(req.file.path);

      const themes = extractThemesTFIDF(openResponses);

      const themeSentimentMap = {};

      themes.forEach((t) => {
        themeSentimentMap[t.theme] = { positive: 0, neutral: 0, negative: 0 };

        t.quotes.forEach((quote) => {
          const score =
            vader.SentimentIntensityAnalyzer.polarity_scores(quote).compound;
          if (score > 0.05) themeSentimentMap[t.theme].positive++;
          else if (score < -0.05) themeSentimentMap[t.theme].negative++;
          else themeSentimentMap[t.theme].neutral++;
        });
      });

      const themesWithSentiment = themes.map((t) => ({
        ...t,
        sentiment: themeSentimentMap[t.theme] || {
          positive: 0,
          neutral: 0,
          negative: 0,
        },
      }));

      res.json({
        totalResponses: total,
        sentiment: { positive, neutral, negative },
        percentages: {
          positive: ((positive / total) * 100).toFixed(1),
          neutral: ((neutral / total) * 100).toFixed(1),
          negative: ((negative / total) * 100).toFixed(1),
        },
        averageRating: total ? (ratingSum / total).toFixed(2) : null,
        ratingDistribution,
        themes: themesWithSentiment,
      });
    });
});

module.exports = router;
