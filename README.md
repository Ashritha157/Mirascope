MiraScope – Feedback Analysis Platform

MiraScope is a feedback analysis platform that processes CSV-based feedback to generate a one-page executive summary, key themes, sentiment insights and ratings analysis.
The platform is designed to transform raw feedback into structured insights without requiring manual review.

Problem Statement
The problems usually faced by organisations is that they get large amount of unstructured data, mixed rating formats(text and numeric), difficulty in identifying dominant themes and key insights.
MiraScope addresses these by normalizing text and numeric ratings into a single scale ,automatically extracting dominant feedback themes ,analyzing sentiment globally and per theme and selecting representative feedback quotes.

Setup and installation instructions

    Backend Setup

    cd backend
    npm install
    npm install express cors multer csv-parser
    npm install vader-sentiment natural stopword
    node server.js

    Frontend Setup

    cd frontend
    npm install
    npm start

Usage guide and feature descriptions

CSV Input Format
The uploaded CSV file includes the following columns
name,email,rating,feedback

The rating formats are textual and numeric and are normalized on the scale 1-5

Upload a feedback CSV file through the interface and click Analyze CSV.

The displayed content would be:
1.Executive Summary
    Total number of responses ,Percentage of positive, neutral, and negative feedback

2.Rating
    Visual breakdown of ratings (1–5) ,Proportional bar indicators

3.Key Themes & Representative Quotes
    Automatically extracted themes using TF-IDF ,
    Each theme displays:Best positive response,Best neutral response,Strongest negative response

4.Visual Charts
    Stacked bar chart
    Green → Positive
    Yellow → Neutral
    Red → Negative


Tech Stack

Frontend
    React
    Chart.js
    JavaScript (ES6+)
    Inline CSS styling

Backened
    Node.js
    Express.js
    Multer 
    csv-parser
 
NLP & Analytics
    vader-sentiment
    natural (TF-IDF)
    stopword

Credits & Attributions
VADER Sentiment Analysis
https://github.com/vaderSentiment/vaderSentiment

Natural (Node.js NLP Toolkit)
https://github.com/NaturalNode/natural

Stopword
https://www.npmjs.com/package/stopword

Chart.js
https://www.chartjs.org/

React ChartJS 2
https://react-chartjs-2.js.org/

Use of AI(ChatGPT)
