const natural = require("natural");
const stopword = require("stopword");
const vader = require("vader-sentiment");

const stemmer = natural.PorterStemmer;

function extractThemesTFIDF(responses) {
  if (!responses || responses.length === 0) return [];

  const tfidf = new natural.TfIdf();

  responses.forEach((text) => {
    const cleaned = text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(" ");

    const filtered = stopword.removeStopwords(cleaned);
    tfidf.addDocument(filtered.join(" "));
  });

  let stemScores = {};
  let stemToWord = {};

  tfidf.documents.forEach((_, index) => {
    tfidf.listTerms(index).forEach((item) => {
      if (item.term.length < 3) return;

      const stem = stemmer.stem(item.term);

      stemScores[stem] = (stemScores[stem] || 0) + item.tfidf;

      if (
        !stemToWord[stem] ||
        stemScores[stem] > (stemScores[stemToWord[stem]] || 0)
      ) {
        stemToWord[stem] = item.term;
      }
    });
  });

  const topStems = Object.entries(stemScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([stem]) => stem);

  return topStems.map((stem) => {
    const theme = stemToWord[stem];

    const relatedResponses = responses.filter((text) =>
      text.toLowerCase().includes(theme)
    );

    const scored = relatedResponses.map((text) => {
      const sentimentScore =
        vader.SentimentIntensityAnalyzer.polarity_scores(text).compound;

      const tfidfScore = stemScores[stem] || 1;

      return {
        text,
        sentimentScore,
        impactScore: Math.abs(sentimentScore) * tfidfScore,
      };
    });

    const positive = scored
      .filter((s) => s.sentimentScore > 0.05)
      .sort((a, b) => b.impactScore - a.impactScore)[0];

    const negative = scored
      .filter((s) => s.sentimentScore < -0.05)
      .sort((a, b) => b.impactScore - a.impactScore)[0];

    const neutral = scored
      .filter((s) => Math.abs(s.sentimentScore) <= 0.05)
      .sort(
        (a, b) =>
          Math.abs(a.sentimentScore) - Math.abs(b.sentimentScore)
      )[0];

    return {
      theme,
      quotes: [positive?.text, neutral?.text, negative?.text].filter(Boolean),
    };
  });
}

module.exports = { extractThemesTFIDF };
