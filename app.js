const express = require("express");
const fs = require("fs");
const path = require("path");
const natural = require("natural");

const app = express();
const PORT = 3000;

// Load questions and answers
const qaFilePath = path.join(__dirname, "data", "qa.json");
const qaData = JSON.parse(fs.readFileSync(qaFilePath, "utf-8"));

// Load questions and answers for list
const qaListFilePath = path.join(__dirname, "data", "qa-back.json");
const qaList = JSON.parse(fs.readFileSync(qaListFilePath, "utf-8"));

// Prepare tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Preprocess intents
qaData.intents.forEach((intent) => {
    intent.patterns = intent.patterns.map((pattern) =>
        tokenizer.tokenize(pattern.toLowerCase()).map((word) => stemmer.stem(word))
    );
});

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs", { qaList });
});

app.post("/api/chat", (req, res) => {
    const { question } = req.body;
    const answer = findBestMatch(question);
    res.json({ question, answer });
});

// Add question-answer pair
app.post("/api/add", (req, res) => {
    const { question, answer } = req.body;
    qaData[question] = answer;
    fs.writeFileSync(qaFilePath, JSON.stringify(qaData, null, 2), "utf-8");
    res.json({ message: "Pertanyaan dan jawaban berhasil ditambahkan." });
});

// NLP function to find best match
function findBestMatch(question) {
    const tokenizedQuestion = tokenizer
        .tokenize(question.toLowerCase())
        .map((word) => stemmer.stem(word));

    let bestMatch = null;
    let highestScore = 0;

    for (const intent of qaData.intents) {
        for (const pattern of intent.patterns) {
            const score = calculateMatchScore(tokenizedQuestion, pattern);
            if (score > highestScore) {
                highestScore = score;
                bestMatch = intent;
            }
        }
    }

    if (bestMatch && highestScore > 0.3) {
        // Threshold for accepting a match
        return bestMatch.responses[Math.floor(Math.random() * bestMatch.responses.length)];
    } else {
        return "Maaf, saya tidak memahami pertanyaan Anda. Bisakah Anda mengajukan pertanyaan dengan cara lain?";
    }
}

// Function to calculate match score
function calculateMatchScore(questionTokens, patternTokens) {
    let matchedTokens = 0;
    for (const token of questionTokens) {
        if (patternTokens.includes(token)) {
            matchedTokens++;
        }
    }
    return matchedTokens / Math.max(questionTokens.length, patternTokens.length);
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
