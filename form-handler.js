
// ─── API Routes (Vercel Serverless — Power Automate URLs stay server-side) ────
const API_BASE = "https://orchvate-news-letter.vercel.app/api";

const NEWSLETTER_API = `${API_BASE}/submit-newsletter`;
const INQUIRY_API    = `${API_BASE}/submit-inquiry`;
const UNSUBSCRIBE_API = `${API_BASE}/unsubscribe`;

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
  console.log('Starting newsletter submission...');
  const originalText = submitButton.textContent;
  setButtonLoading(submitButton, true);

  const payload = {
    name:  optional(name),
    email: optional(email),
  };

  try {
    console.log('Sending payload:', payload);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout for Power Automate

    const response = await fetch(NEWSLETTER_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Response received:', response.status);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      // Some APIs return empty response bodies (Power Automate)
      result = { success: true };
    }
    console.log('Response data:', result);

    if (result.success === false) {
      throw new Error("Server returned failure: " + (result.message || "Unknown error"));
    }

    console.log('Newsletter submission successful');
    // Reset button after successful submission
    setButtonLoading(submitButton, false, originalText);
    return true;

  } catch (error) {
    console.error("Newsletter submission failed:", error);
    if (error.name === 'AbortError') {
       alert("Request timed out. Please try again.");
    } else {
       alert("Something went wrong. Please try again later.");
    }
    setButtonLoading(submitButton, false, originalText);
    return false;
  }
}

// ─── General Inquiry / Conversation Form ──────────────────────────────────────
async function handleInquirySubmission(fields, submitButton) {
  console.log('Starting inquiry submission...');
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
    console.log('Sending payload:', payload);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout for Power Automate

    const response = await fetch(INQUIRY_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Response received:', response.status);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      // Some APIs return empty response bodies (Power Automate)
      result = { success: true };
    }
    console.log('Response data:', result);

    if (result.success === false) {
      throw new Error("Server returned failure: " + (result.message || "Unknown error"));
    }

    console.log('Inquiry submission successful');
    // Reset button after successful submission
    setButtonLoading(submitButton, false, originalText);
    return true;

  } catch (error) {
    console.error("Inquiry submission failed:", error);
    if (error.name === 'AbortError') {
       alert("Request timed out. Please try again.");
    } else {
       alert("Something went wrong. Please try again later.");
    }
    setButtonLoading(submitButton, false, originalText);
    return false;
  }
}

// ─── Unsubscribe Submission ───────────────────────────────────────────────────
async function handleUnsubscribeSubmission(name, email, reason, submitButton) {
  console.log('Starting unsubscribe submission...');
  const originalText = submitButton.textContent;
  setButtonLoading(submitButton, true);

  const payload = {
    name:   optional(name),
    email:  optional(email),
    reason: optional(reason),
  };


  try {
    console.log('Sending payload:', payload);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(UNSUBSCRIBE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Response received:', response.status);

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      result = { success: true };
    }

    console.log('Unsubscribe submission successful');
    setButtonLoading(submitButton, false, originalText);
    return true;

  } catch (error) {
    console.error("Unsubscribe submission failed:", error);
    if (error.name === 'AbortError') {
       alert("Request timed out. Please try again.");
    } else {
       alert("Something went wrong. Please try again later.");
    }
    setButtonLoading(submitButton, false, originalText);
    return false;
  }
}
