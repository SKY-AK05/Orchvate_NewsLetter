
// ─── API Routes (Vercel Serverless — Power Automate URLs stay server-side) ────
const NEWSLETTER_API = "/api/submit-newsletter";
const INQUIRY_API    = "/api/submit-inquiry";

// ─── Helper: button loading state ─────────────────────────────────────────────
function setButtonLoading(button, isLoading, originalText) {
  if (isLoading) {
    button.disabled = true;
    button.textContent = "Submitting...";
    button.style.opacity = "0.7";
    button.style.cursor = "not-allowed";
  } else {
    button.disabled = false;
    button.textContent = originalText;
    button.style.opacity = "1";
    button.style.cursor = "pointer";
  }
}

// ─── Helper: sanitise optional field ──────────────────────────────────────────
function optional(value) {
  return (value || "").trim();
}

// ─── Newsletter / Updates Subscription ────────────────────────────────────────
async function handleUpdatesSubmission(name, email, submitButton) {
  const originalText = submitButton.textContent;
  setButtonLoading(submitButton, true);

  const payload = {
    name:  optional(name),
    email: optional(email),
  };

  try {
    const response = await fetch(NEWSLETTER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error("Server returned failure");
    }

    return true;

  } catch (error) {
    console.error("Newsletter submission failed:", error);
    alert("Something went wrong. Please try again later.");
    setButtonLoading(submitButton, false, originalText);
    return false;
  }
}

// ─── General Inquiry / Conversation Form ──────────────────────────────────────
async function handleInquirySubmission(fields, submitButton) {
  const originalText = submitButton.textContent;
  setButtonLoading(submitButton, true);

  const payload = {
    name:             optional(fields.name),
    organisation:     optional(fields.organisation),
    email:            optional(fields.email),
    topic:            optional(fields.topic),
    message:          optional(fields.message),
    newsletter_opt_in: fields.newsletter_opt_in ? "Yes" : "No",
    source:           fields.source_override || "Website",
  };

  try {
    const response = await fetch(INQUIRY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error("Server returned failure");
    }

    return true;

  } catch (error) {
    console.error("Inquiry submission failed:", error);
    alert("Something went wrong. Please try again later.");
    setButtonLoading(submitButton, false, originalText);
    return false;
  }
}
