document.getElementById("send-button").addEventListener("click", async () => {
    const input = document.getElementById("chat-input");
    const output = document.getElementById("chat-output");

    if (input.value.trim() !== "") {
        const question = input.value;
        output.innerHTML += `<p class="user-chat"> ${question} <strong><i class="fas fa-user" style="color: black; font-size: 20px;"></i></strong></p>`;

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question }),
        });
        const data = await response.json();

        output.innerHTML += `<pre class="bot-chat" style=" white-space: pre-wrap; font-family: 'Helvetica Neue', Arial, sans-serif;"><strong><i class="fas fa-robot" style="color: black; font-size: 20px;"></i></strong>\n${data.answer}</pre>`;

        input.value = "";
        output.scrollTop = output.scrollHeight;
    }
});

// Listen for the Enter key
document.getElementById("chat-input").addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        event.preventDefault(); // Prevents a new line from being added in the input field
        document.getElementById("send-button").click(); // Trigger the click event on the send button
    }
});
