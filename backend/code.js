const express = require('express')
const multer = require('multer')
const cors = require('cors')
const csv = require('csv-parser')
const { Readable } = require('stream')
const vader = require('vader-sentiment')
const natural = require('natural')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function parseCSV(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString());
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

function analyzeSentiment(text) {
  const intensity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  
  let sentiment;
  if (intensity.compound >= 0.05) {
    sentiment = 'positive';
  } else if (intensity.compound <= -0.05) {
    sentiment = 'negative';
  } else {
    sentiment = 'neutral';
  }
  
  return {
    sentiment,
    score: intensity.compound,
    details: intensity
  };
}


function processResponses(rawData) {
  const responses = [];
rawData.forEach(row => {
    const values = Object.values(row);
    values.forEach(value => {
      if (value && typeof value === 'string' && value.length > 10) {
        responses.push({ text: value });
      }
    });
  });
  responses.forEach(response => {
    const analysis = analyzeSentiment(response.text);
    response.sentiment = analysis.sentiment;
    response.sentimentScore = analysis.score;
  });
  
  return responses;
}
