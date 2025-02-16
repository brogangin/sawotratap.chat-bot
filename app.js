const express = require("express");
const fs = require("fs");
const path = require("path");
const natural = require("natural");
const sw = require("stopword");

const app = express();
const PORT = 3000;

// Load questions and answers
const qaFilePath = path.join(__dirname, "data", "qa.json");
const qaData = JSON.parse(fs.readFileSync(qaFilePath, "utf-8"));

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Preprocess questions
const processedQA = Object.entries(qaData).map(([question, answer]) => ({
    processedQuestion: sw
        .removeStopwords(tokenizer.tokenize(question.toLowerCase()))
        .map((word) => stemmer.stem(word)),
    originalQuestion: question,
    answer: answer,
}));

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
    res.render("index.ejs", { qaData });
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
    processedQA.push({
        processedQuestion: sw
            .removeStopwords(tokenizer.tokenize(question.toLowerCase()))
            .map((word) => stemmer.stem(word)),
        originalQuestion: question,
        answer: answer,
    });

    fs.writeFileSync(qaFilePath, JSON.stringify(qaData, null, 2), "utf-8");
    res.json({ message: "Pertanyaan dan jawaban berhasil ditambahkan." });
});

function findBestMatch(question) {
    const tokenizedQuestion = sw
        .removeStopwords(tokenizer.tokenize(question.toLowerCase()))
        .map((word) => stemmer.stem(word));

    let bestMatch = null;
    let highestScore = 0;

    for (const qa of processedQA) {
        const score = calculateMatchScore(tokenizedQuestion, qa.processedQuestion);
        if (score > highestScore) {
            highestScore = score;
            bestMatch = qa;
        }
    }

    if (bestMatch && highestScore > 0.3) {
        // Threshold for accepting a match
        return bestMatch.answer;
    } else {
        return "Maaf, saya tidak memahami pertanyaan Anda. Bisakah Anda mengajukan pertanyaan dengan cara lain?";
    }
}

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
