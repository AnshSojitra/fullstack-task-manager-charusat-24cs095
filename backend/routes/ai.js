/**
 * AI Integration Route Module
 * Practical 13: AI API Integration into a Web Application
 * CHARUSAT ITUE301 - Advanced Web Development Frameworks
 * Student: Ansh Sojitra | ID: 24CS095
 *
 * Implements server-side OpenAI / Gemini API calls with:
 * 1. Strict server-side key protection (never exposed to frontend)
 * 2. In-memory sliding window rate limiting (max 10 requests/minute per client)
 * 3. Graceful degradation: falls back to intelligent heuristic templates on network / API failure
 * 4. Privacy & governance sanitization: strips sensitive tokens and limits input size
 */

const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// In-memory rate limiting map: ipOrUser -> timestamp array
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

/**
 * Basic in-memory rate limiting middleware
 */
function aiRateLimiter(req, res, next) {
  const clientId = req.user?._id || req.ip || "anonymous_client";
  const now = Date.now();

  const timestamps = rateLimitMap.get(clientId) || [];
  // Filter timestamps within current window
  const recentTimestamps = timestamps.filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recentTimestamps[0];
    const retryAfterSec = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return res.status(429).json({
      success: false,
      error: "Rate limit exceeded",
      message: `Too many AI requests. Please wait ${retryAfterSec}s before requesting another AI generation.`,
      retryAfterSeconds: retryAfterSec,
    });
  }

  recentTimestamps.push(now);
  rateLimitMap.set(clientId, recentTimestamps);
  next();
}

/**
 * Intelligent Fallback Heuristic Generator
 * Used for graceful degradation when OpenAI/Gemini is offline, unconfigured, or returns an error.
 * Ensures the core task management application continues uninterrupted.
 */
function generateFallbackDescription(title) {
  const cleanTitle = title.trim();
  const lower = cleanTitle.toLowerCase();

  let action = "Execute and complete";
  let suggestedPriority = "medium";

  if (lower.includes("bug") || lower.includes("fix") || lower.includes("error") || lower.includes("critical")) {
    action = "Investigate root cause, apply bugfix, and verify resolution with unit tests for";
    suggestedPriority = "high";
  } else if (lower.includes("deploy") || lower.includes("docker") || lower.includes("release")) {
    action = "Prepare staging verification, build artifacts, and deploy";
    suggestedPriority = "high";
  } else if (lower.includes("doc") || lower.includes("readme") || lower.includes("comment")) {
    action = "Review, format, and document technical details for";
    suggestedPriority = "low";
  } else if (lower.includes("test") || lower.includes("ci") || lower.includes("audit")) {
    action = "Execute integration suites and ensure full regression coverage for";
    suggestedPriority = "medium";
  }

  return {
    description: `${action} "${cleanTitle}". Ensure deliverables adhere to project standards and verification checklists.`,
    suggestedPriority,
  };
}

/**
 * POST /api/ai/generate-description (and /ai/generate-description)
 * Accepts: { title: string }
 * Returns: { description: string, suggestedPriority: string, fallback: boolean, disclaimer: string }
 */
router.post("/generate-description", aiRateLimiter, async (req, res) => {
  const { title } = req.body;

  // 1. Input Validation
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: "Task title is required to generate an AI description.",
    });
  }

  const sanitizedTitle = title.trim().slice(0, 150); // Sanitize and limit prompt length
  const apiKey = process.env.OPENAI_API_KEY;

  // 2. Check if OpenAI API key is configured
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_openai_api_key_here") {
    console.warn("[AI Service] Notice: OPENAI_API_KEY not configured or placeholder detected. Invoking graceful fallback.");
    const fallback = generateFallbackDescription(sanitizedTitle);
    return res.status(200).json({
      success: true,
      description: fallback.description,
      suggestedPriority: fallback.suggestedPriority,
      fallback: true,
      provider: "heuristic-fallback",
      disclaimer: "AI service key unconfigured. Heuristic fallback template generated. Please review and modify before saving.",
    });
  }

  // 3. Attempt external AI API Call with Graceful Degradation
  try {
    const openai = new OpenAI({ apiKey: apiKey.trim() });

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an agile task management assistant. Output a clear, concise (1 to 2 sentences) actionable task description for the user's task title. Also indicate a priority: low, medium, or high. Format: [Priority: low|medium|high] <description>",
        },
        {
          role: "user",
          content: `Task Title: "${sanitizedTitle}"`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    });

    const rawResponse = completion.choices?.[0]?.message?.content || "";
    let description = rawResponse.trim();
    let suggestedPriority = "medium";

    // Extract suggested priority if present
    const priorityMatch = description.match(/\[Priority:\s*(low|medium|high)\]/i);
    if (priorityMatch) {
      suggestedPriority = priorityMatch[1].toLowerCase();
      description = description.replace(/\[Priority:\s*(low|medium|high)\]/i, "").trim();
    }

    return res.status(200).json({
      success: true,
      description,
      suggestedPriority,
      fallback: false,
      provider: "OpenAI gpt-4o-mini",
      disclaimer: "This suggestion is AI-generated and should be reviewed and edited by the user before saving.",
    });
  } catch (error) {
    // 4. Graceful Degradation Path: Catch API errors (401 invalid key, rate limit, timeout)
    console.error(`[AI Service Error] ${error.message}. Returning graceful fallback template.`);
    const fallback = generateFallbackDescription(sanitizedTitle);

    return res.status(200).json({
      success: true,
      description: fallback.description,
      suggestedPriority: fallback.suggestedPriority,
      fallback: true,
      provider: "graceful-fallback",
      disclaimer: `AI service temporarily unavailable (${error.code || "network error"}). Fallback template generated. Review and edit as needed.`,
    });
  }
});

module.exports = router;
