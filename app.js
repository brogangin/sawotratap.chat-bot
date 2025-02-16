const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Load questions and answers
const qaFilePath = path.join(__dirname, 'data', 'qa.json');
let qaData = JSON.parse(fs.readFileSync(qaFilePath, 'utf-8'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.render('index', { qaData });
});

app.post('/api/chat', (req, res) => {
    const { question } = req.body;
    // Normalisasi user input: lowercase dan hapus spasi tambahan
    const normalizedQuestion = question.toLowerCase().trim().replace(/\s+/g, ' ');

    // Mencari pertanyaan yang cocok dalam qaData
    const matchingKey = Object.keys(qaData).find(key => {
        // Normalisasi key dari qaData: lowercase dan hapus spasi tambahan
        const normalizedKey = key.toLowerCase().trim().replace(/\s+/g, ' ');
        return normalizedKey === normalizedQuestion;
    });

    const answer = matchingKey ? qaData[matchingKey] : "Maaf, saya tidak tahu jawabannya.";
    
    res.json({ question, answer });
});

// Add question-answer pair
app.post('/api/add', (req, res) => {
    const { question, answer } = req.body;
    qaData[question] = answer;
    fs.writeFileSync(qaFilePath, JSON.stringify(qaData, null, 2), 'utf-8');
    res.json({ message: "Pertanyaan dan jawaban berhasil ditambahkan." });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
