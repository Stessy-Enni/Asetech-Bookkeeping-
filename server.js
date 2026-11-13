// server.ts
import "dotenv/config";
import express from "express";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var app = express();
app.use(express.json({ limit: "5mb" }));
var BRANDING_STORE_PATH = path.join(process.cwd(), ".branding-store.json");
function loadBrandingStore() {
  try {
    if (fs.existsSync(BRANDING_STORE_PATH)) {
      const raw = fs.readFileSync(BRANDING_STORE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        appLogoDataUrl: typeof parsed?.appLogoDataUrl === "string" ? parsed.appLogoDataUrl : null,
        appLogoFit: parsed?.appLogoFit === "contain" ? "contain" : "cover",
        ownerPasscodeHash: typeof parsed?.ownerPasscodeHash === "string" ? parsed.ownerPasscodeHash : null
      };
    }
  } catch (err) {
    console.warn("Could not read branding store from disk, using in-memory store:", err);
  }
  return { appLogoDataUrl: null, appLogoFit: "cover", ownerPasscodeHash: null };
}
function saveBrandingStore(store) {
  try {
    fs.writeFileSync(BRANDING_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist branding store to disk:", err);
  }
}
function hashPasscode(passcode) {
  return crypto.createHash("sha256").update(`asetech-owner:${passcode}`).digest("hex");
}
function verifyPasscodeMatch(inputPasscode, expectedHash) {
  const inputHash = hashPasscode(inputPasscode);
  const a = Buffer.from(inputHash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
var brandingStore = loadBrandingStore();
var activeOwnerTokens = /* @__PURE__ */ new Map();
var TOKEN_TTL_MS = 1e3 * 60 * 60 * 8;
function requireOwnerAuth(req, res, next) {
  const token = req.header("x-owner-token");
  if (!token) {
    return res.status(403).json({ error: "Owner authorization required. Clients cannot modify the app logo." });
  }
  const expiresAt = activeOwnerTokens.get(token);
  if (!expiresAt || Date.now() > expiresAt) {
    activeOwnerTokens.delete(token);
    return res.status(403).json({ error: "Owner session expired. Please unlock Owner Access again." });
  }
  next();
}
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});
app.get("/api/branding", (_req, res) => {
  const envPasscode = process.env.OWNER_PASSCODE?.trim();
  const hasOwnerPasscode = Boolean(envPasscode || brandingStore.ownerPasscodeHash);
  res.json({
    appLogoDataUrl: brandingStore.appLogoDataUrl,
    appLogoFit: brandingStore.appLogoFit,
    hasOwnerPasscode,
    envManaged: Boolean(envPasscode)
  });
});
app.post("/api/owner/unlock", (req, res) => {
  const passcode = typeof req.body?.passcode === "string" ? req.body.passcode.trim() : "";
  if (!passcode || passcode.length < 4) {
    return res.status(400).json({ error: "Passcode must be at least 4 characters." });
  }
  const envPasscode = process.env.OWNER_PASSCODE?.trim();
  if (envPasscode) {
    if (!verifyPasscodeMatch(passcode, hashPasscode(envPasscode))) {
      return res.status(403).json({ error: "Incorrect owner passcode." });
    }
  } else if (!brandingStore.ownerPasscodeHash) {
    brandingStore.ownerPasscodeHash = hashPasscode(passcode);
    saveBrandingStore(brandingStore);
  } else {
    if (!verifyPasscodeMatch(passcode, brandingStore.ownerPasscodeHash)) {
      return res.status(403).json({ error: "Incorrect owner passcode." });
    }
  }
  const token = crypto.randomBytes(24).toString("hex");
  activeOwnerTokens.set(token, Date.now() + TOKEN_TTL_MS);
  res.json({ token, expiresInMs: TOKEN_TTL_MS });
});
app.post("/api/owner/verify-token", requireOwnerAuth, (_req, res) => {
  res.json({ valid: true });
});
app.post("/api/owner/lock", (req, res) => {
  const token = req.header("x-owner-token");
  if (token) activeOwnerTokens.delete(token);
  res.json({ locked: true });
});
app.post("/api/branding/logo", requireOwnerAuth, (req, res) => {
  const { appLogoDataUrl, appLogoFit } = req.body || {};
  if (appLogoDataUrl !== null && typeof appLogoDataUrl !== "string") {
    return res.status(400).json({ error: "Invalid logo data format." });
  }
  if (typeof appLogoDataUrl === "string") {
    const isValidImageDataUrl = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(
      appLogoDataUrl
    );
    if (!isValidImageDataUrl) {
      return res.status(400).json({ error: "Unsupported image format. Please upload PNG, JPG, WebP, GIF, or SVG." });
    }
    if (appLogoDataUrl.length > 18e5) {
      return res.status(400).json({ error: "Uploaded logo image is too large (max ~1.2MB after encoding)." });
    }
  }
  brandingStore.appLogoDataUrl = appLogoDataUrl ?? null;
  brandingStore.appLogoFit = appLogoFit === "contain" ? "contain" : "cover";
  saveBrandingStore(brandingStore);
  res.json({
    appLogoDataUrl: brandingStore.appLogoDataUrl,
    appLogoFit: brandingStore.appLogoFit
  });
});
app.delete("/api/branding/logo", requireOwnerAuth, (_req, res) => {
  brandingStore.appLogoDataUrl = null;
  saveBrandingStore(brandingStore);
  res.json({ appLogoDataUrl: null, appLogoFit: brandingStore.appLogoFit });
});
var CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest"
];
function extractGeminiErrorDetails(error) {
  const rawMessage = typeof error?.message === "string" ? error.message : String(error || "Unknown error");
  let code = typeof error?.status === "number" ? error.status : error?.code;
  let statusText = typeof error?.status === "string" ? error.status : void 0;
  let cleanMessage = rawMessage;
  const jsonStart = rawMessage.indexOf("{");
  if (jsonStart !== -1) {
    try {
      const parsed = JSON.parse(rawMessage.slice(jsonStart));
      const inner = parsed?.error || parsed;
      if (typeof inner?.code === "number") code = inner.code;
      if (typeof inner?.status === "string") statusText = inner.status;
      if (typeof inner?.message === "string") cleanMessage = inner.message;
    } catch {
    }
  }
  return { code, status: statusText, message: cleanMessage };
}
function isTransientError(details) {
  if (details.code && [429, 500, 502, 503, 504].includes(details.code)) return true;
  const upperStatus = (details.status || "").toUpperCase();
  if (["UNAVAILABLE", "RESOURCE_EXHAUSTED", "INTERNAL", "DEADLINE_EXCEEDED"].includes(upperStatus)) {
    return true;
  }
  const lowerMsg = details.message.toLowerCase();
  return lowerMsg.includes("high demand") || lowerMsg.includes("temporarily unavailable") || lowerMsg.includes("overloaded") || lowerMsg.includes("try again later") || lowerMsg.includes("503") || lowerMsg.includes("429") || lowerMsg.includes("timeout") || lowerMsg.includes("econnreset");
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function buildDatasetSummary(transactions, currencyCode) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return "No transactions currently loaded.";
  }
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseByCategory = /* @__PURE__ */ new Map();
  const incomeByCategory = /* @__PURE__ */ new Map();
  const monthlyBreakdown = /* @__PURE__ */ new Map();
  for (const t of transactions) {
    const amount = Number(t.amount) || 0;
    const month = typeof t.date === "string" && t.date.length >= 7 ? t.date.slice(0, 7) : "Unknown";
    const category = t.category || "Uncategorized";
    if (!monthlyBreakdown.has(month)) {
      monthlyBreakdown.set(month, { income: 0, expense: 0, categories: /* @__PURE__ */ new Map() });
    }
    const mData = monthlyBreakdown.get(month);
    if (t.type === "income") {
      totalIncome += amount;
      incomeByCategory.set(category, (incomeByCategory.get(category) || 0) + amount);
      mData.income += amount;
    } else {
      totalExpense += amount;
      expenseByCategory.set(category, (expenseByCategory.get(category) || 0) + amount);
      mData.expense += amount;
      mData.categories.set(category, (mData.categories.get(category) || 0) + amount);
    }
  }
  const netProfit = totalIncome - totalExpense;
  const topExpenseCats = Array.from(expenseByCategory.entries()).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `  - ${cat}: ${amt.toFixed(2)} ${currencyCode}`).join("\n");
  const topIncomeCats = Array.from(incomeByCategory.entries()).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => `  - ${cat}: ${amt.toFixed(2)} ${currencyCode}`).join("\n");
  const monthlyLines = Array.from(monthlyBreakdown.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([month, data]) => {
    const topCat = Array.from(data.categories.entries()).sort((a, b) => b[1] - a[1])[0];
    const topCatStr = topCat ? `${topCat[0]} (${topCat[1].toFixed(2)} ${currencyCode})` : "None";
    return `  - ${month}: Income=${data.income.toFixed(2)}, Expenses=${data.expense.toFixed(2)}, Net=${(data.income - data.expense).toFixed(2)} ${currencyCode} | Top Expense Category: ${topCatStr}`;
  }).join("\n");
  const recentTx = [...transactions].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 250).map(
    (t) => `${t.date}: [${String(t.type || "expense").toUpperCase()}] ${t.description} | Category: ${t.category} | Amount: ${Number(t.amount).toFixed(2)} ${currencyCode}${t.paymentMethod ? ` | Method: ${t.paymentMethod}` : ""}`
  ).join("\n");
  return `SUMMARY TOTALS (${transactions.length} transactions, Currency: ${currencyCode}):
- Total Income: ${totalIncome.toFixed(2)} ${currencyCode}
- Total Expenses: ${totalExpense.toFixed(2)} ${currencyCode}
- Net Profit: ${netProfit.toFixed(2)} ${currencyCode}

EXPENSE CATEGORIES (ALL-TIME):
${topExpenseCats || "  - None"}

INCOME CATEGORIES (ALL-TIME):
${topIncomeCats || "  - None"}

MONTHLY BREAKDOWN:
${monthlyLines || "  - None"}

TRANSACTIONS (showing ${Math.min(transactions.length, 250)} of ${transactions.length}):
${recentTx}`;
}
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, transactions, currency } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "Gemini API key is not configured. Please check your API key in Settings > Secrets."
      });
    }
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
    const currencyCode = currency?.code || "USD";
    const currencySymbol = currency?.symbol || "$";
    const datasetSummary = buildDatasetSummary(transactions, currencyCode);
    const systemInstruction = `You are Asetech AI, an expert virtual bookkeeping and financial analyst assistant for small businesses. You have direct access to the user's current bookkeeping transaction dataset.
Today's reference date context: inspect the actual dates in the dataset when answering "this month" or "latest month" (if the current calendar month has no transactions, explicitly mention the latest month present in the dataset as well).
Format currency values using ${currencySymbol} (${currencyCode}). Answer clearly, concisely, and accurately using exact figures from the dataset below.

${datasetSummary}`;
    const rawMessages = Array.isArray(messages) ? messages : [];
    const firstUserIdx = rawMessages.findIndex((m) => m.role === "user");
    const trimmedHistory = firstUserIdx >= 0 ? rawMessages.slice(firstUserIdx) : [];
    const contents = trimmedHistory.length > 0 ? trimmedHistory.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: String(m.content || "") }]
    })) : [{ role: "user", parts: [{ text: "Give me a financial summary of my dataset." }] }];
    let lastError = null;
    let lastDetails = null;
    for (const model of CANDIDATE_MODELS) {
      const maxAttempts = 2;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction
            }
          });
          const text = response.text?.trim();
          if (text) {
            return res.json({ reply: text, model });
          }
          throw new Error("Empty response received from model.");
        } catch (err) {
          lastError = err;
          lastDetails = extractGeminiErrorDetails(err);
          console.warn(
            `Gemini attempt ${attempt}/${maxAttempts} failed for model ${model}:`,
            lastDetails.code || lastDetails.status || "",
            lastDetails.message
          );
          if (lastDetails.code === 400 || lastDetails.code === 403 || lastDetails.status === "PERMISSION_DENIED" || lastDetails.message.includes("API_KEY_INVALID")) {
            return res.status(lastDetails.code || 403).json({
              error: "Invalid or unauthorized Gemini API key. Please check your API key in Settings > Secrets."
            });
          }
          if (!isTransientError(lastDetails)) {
            break;
          }
          if (attempt < maxAttempts) {
            const backoffMs = 700 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300);
            await sleep(backoffMs);
          }
        }
      }
    }
    const statusCode = lastDetails?.code && lastDetails.code >= 400 ? lastDetails.code : 503;
    const friendlyMessage = isTransientError(lastDetails || { message: "" }) ? "Gemini AI is currently experiencing temporary high demand across available models. Please wait a few seconds and click Retry." : lastDetails?.message || lastError?.message || "Failed to generate AI response.";
    return res.status(statusCode).json({ error: friendlyMessage });
  } catch (error) {
    console.error("Gemini API chat error:", error);
    const details = extractGeminiErrorDetails(error);
    return res.status(500).json({ error: details.message || "Failed to generate AI response." });
  }
});
async function startServer() {
  const runningBundledServer = path.basename(process.argv[1] || "") === "server.js";
  const isProd = process.env.NODE_ENV === "production" || process.argv.includes("--production") || runningBundledServer;
  const port = Number(process.env.PORT) || 3e3;
  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa"
      });
      app.use(vite.middlewares);
      console.log("Vite middleware enabled for development.");
    } catch (e) {
      console.warn("Failed to start Vite middleware:", e);
    }
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api/")) return next();
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static files from ${distPath}`);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on port ${port} (prod: ${isProd})`);
  });
}
startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
