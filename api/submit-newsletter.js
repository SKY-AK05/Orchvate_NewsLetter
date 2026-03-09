// Vercel Serverless Function — Newsletter Subscription
// Proxies form data to Power Automate, keeping the URL private server-side.

const NEWSLETTER_ENDPOINT =
  "https://defaultea77fe37fd2c429487c38746bce662.5a.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/39931e4bb402413282a57d0e9242d690/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YSDpdrV385rElvAOrffDG8oZZOFVHrvF1GGW8Pziom8";

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only accept POST
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = req.body;

    const response = await fetch(NEWSLETTER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.error("Power Automate Error:", response.status, await response.text());
      return res.status(500).json({ success: false, message: "Server connection failed" });
    }

    // Power Automate returns 202 Accepted — treat any response as success
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Newsletter submission error:", error);
    return res.status(500).json({ success: false, message: "Submission failed" });
  }
}
