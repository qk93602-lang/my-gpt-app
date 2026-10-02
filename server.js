import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/api/chat", async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages)
      ? req.body.messages
      : [];

    const input = messages
      .filter(m => m && (m.role === "user" || m.role === "assistant"))
      .slice(-30)
      .map(m => ({
        role: m.role,
        content: String(m.content || "")
      }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
      instructions: "請使用繁體中文回答。",
      input
    });

    res.json({
      output_text: response.output_text || ""
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "伺服器發生錯誤"
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
