import React, { useState } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const getThemeColor = (theme) => {
  const t = theme.toLowerCase();
  if (t.includes("service")) return "#4caf50";
  if (t.includes("support")) return "#2196f3";
  if (t.includes("time") || t.includes("delay")) return "#ff9800";
  if (t.includes("quality")) return "#9c27b0";
  if (t.includes("price") || t.includes("cost")) return "#f44336";
  if (t.includes("delivery")) return "#00bcd4";
  if (t.includes("experience")) return "#ffeb3b";
  if (t.includes("staff") || t.includes("team")) return "#ff5722";
  if (t.includes("communication")) return "#8bc34a";
  return "#607d8b";
};

const groupThemesByColorWithSentiment = (themes) => {
  const grouped = {};

  themes.forEach((t) => {
    const color = getThemeColor(t.theme);
    if (!grouped[color]) {
      grouped[color] = {
        theme: t.theme,
        positive: t.sentiment.positive,
        neutral: t.sentiment.neutral,
        negative: t.sentiment.negative,
      };
    } else {
      grouped[color].theme =
        grouped[color].theme.length >= t.theme.length ? grouped[color].theme : t.theme;
      grouped[color].positive += t.sentiment.positive;
      grouped[color].neutral += t.sentiment.neutral;
      grouped[color].negative += t.sentiment.negative;
    }
  });

  return Object.values(grouped);
};

function App() {
  const [file, setFile] = useState(null);
  const [report, setReport] = useState(null);

  const analyzeCSV = async () => {
    if (!file) return alert("Please upload a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:5000/analyze-csv", {
      method: "POST",
      body: formData,
    });

    setReport(await res.json());
  };

  const renderStars = (rating) => {
    const full = Math.round(rating);
    return (
      <span style={{ color: "#FFD700", fontSize: 22 }}>
        {"★".repeat(full)}
        {"☆".repeat(5 - full)}
      </span>
    );
  };

  const getThemeIcon = (theme) => {
    const t = theme.toLowerCase();
    if (t.includes("service")) return "🛎️";
    if (t.includes("support")) return "🎧";
    if (t.includes("time") || t.includes("delay")) return "⏱️";
    if (t.includes("quality")) return "🏆";
    if (t.includes("price") || t.includes("cost")) return "💰";
    if (t.includes("delivery")) return "📦";
    if (t.includes("experience")) return "✨";
    if (t.includes("staff") || t.includes("team")) return "👥";
    if (t.includes("communication")) return "📢";
    return "💬";
  };

  return (
    <div style={page}>
      <header style={header}>
        <h1>MiraScope</h1>
        <p>Feedback Analysis Report</p>
      </header>

      {!report && (
        <section style={uploadBox}>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <br />
          <br />
          <button style={btn} onClick={analyzeCSV}>
            Analyze CSV
          </button>
        </section>
      )}

      {report && (
        <section style={content}>
          {/* EXECUTIVE SUMMARY */}
          <h2>Executive Summary</h2>
          <div style={summaryGrid}>
            <SummaryCard title="Responses" value={report.totalResponses} />
            <SummaryCard
              title="Positive"
              value={`${report.percentages.positive}%`}
              color="#4caf50"
            />
            <SummaryCard
              title="Neutral"
              value={`${report.percentages.neutral}%`}
              color="#ffc107"
            />
            <SummaryCard
              title="Negative"
              value={`${report.percentages.negative}%`}
              color="#f44336"
            />
          </div>

          {/* AVERAGE RATING */}
          <h2 style={{ marginTop: 40 }}>Rating</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {renderStars(report.averageRating)}
            <b style={{ fontSize: 20 }}>{report.averageRating} / 5</b>
          </div>

          {/* RATING DISTRIBUTION */}
          <div style={{ marginTop: 30 }}>
            {[5, 4, 3, 2, 1].map((r) => {
              const count = report.ratingDistribution[r];
              const percent = (count / report.totalResponses) * 100;
              return (
                <div key={r} style={ratingRow}>
                  <span style={{ width: 20 }}>{r}</span>
                  <div style={barTrack}>
                    <div style={{ ...barFill, width: `${percent}%` }} />
                  </div>
                  <span style={{ width: 90, textAlign: "right" }}>
                    ( {count} )
                  </span>
                </div>
              );
            })}
          </div>

          {/* THEMES */}
          <h2 style={{ marginTop: 50 }}>Key Themes & Insights</h2>
          <div style={themesWrapper}>
            {report.themes.map((t, i) => (
              <div key={i} style={themeCard}>
                <div style={themeHeader}>
                  <h3 style={themeTitle}>{t.theme}</h3>
                  <span style={themeIcon}>{getThemeIcon(t.theme)}</span>
                </div>
                {t.quotes.map((q, j) => (
                  <div key={j} style={quoteBox}>
                    “{q}”
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* COMBINED STACKED BAR CHART */}
{report.themes.length > 0 && (() => {
  const chartData = groupThemesByColorWithSentiment(report.themes);

  return (
    <div style={{ width: "80%", margin: "40px auto" }}>
      <h2 style={{ textAlign: "center" }}>Responses & Sentiment per Theme</h2>
      <Bar
        data={{
          labels: chartData.map((t) => t.theme),
          datasets: [
            {
              label: "Positive",
              data: chartData.map((t) => Math.ceil(t.positive / 5)),
              backgroundColor: "#4caf50",
            },
            {
              label: "Neutral",
              data: chartData.map((t) => Math.ceil(t.neutral / 5)),
              backgroundColor: "#ffc107",
            },
            {
              label: "Negative",
              data: chartData.map((t) => Math.ceil(t.negative / 5)),
              backgroundColor: "#f44336",
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const datasetLabel = context.dataset.label;
                  const value = context.raw * 5; // Show actual responses
                  return `${datasetLabel}: ${value} responses`;
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              title: { display: true, text: "Themes" },
              // Make bars narrower
              ticks: { autoSkip: false },
              grid: { drawTicks: true },
            },
            y: {
              stacked: true,
              beginAtZero: true,
              title: { display: true, text: "Number of Responses (per 5)" },
              ticks: { stepSize: 1 },
            },
          },
          // Adjust bar width
          datasets: {
            bar: {
              barPercentage: 0.6,   // width of bar within category
              categoryPercentage: 0.6, // space between categories
            },
          },
        }}
      />
    </div>
  );
})()}

        </section>
      )}
    </div>
  );
}

/* COMPONENTS */
const SummaryCard = ({ title, value, color }) => (
  <div style={{ ...card, borderTop: `5px solid ${color || "#6a5af9"}` }}>
    <h1>{value}</h1>
    <p>{title}</p>
  </div>
);

/* STYLES */
const page = { background: "#f4f6fb", minHeight: "100vh", fontFamily: "Arial" };
const header = { background: "#6a5af9", color: "#fff", padding: 40 };
const uploadBox = { textAlign: "center", padding: 60 };
const content = { padding: "40px 80px" };
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 };
const card = { background: "#fff", padding: 30, borderRadius: 14 };

const ratingRow = { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 };
const barTrack = { flex: 1, height: 14, background: "#e0e0e0", borderRadius: 10 };
const barFill = { height: "100%", background: "#6a5af9", borderRadius: 10 };

const themesWrapper = { display: "flex", flexDirection: "column", gap: 30, marginTop: 30 };
const themeCard = { background: "#eef0ff", padding: 26, borderRadius: 22 };
const themeHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 };
const themeTitle = { color: "#4b4ae3", textTransform: "capitalize" };
const themeIcon = { fontSize: 26 };
const quoteBox = { background: "#fff", padding: 14, borderRadius: 14, marginBottom: 10, fontStyle: "italic" };

const btn = { background: "#6a5af9", color: "#fff", padding: "12px 30px", border: "none", borderRadius: 24, cursor: "pointer" };

export default App;
