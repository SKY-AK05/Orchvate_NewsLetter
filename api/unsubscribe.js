// Vercel Serverless Function — Unsubscribe
// Proxies unsubscribe request to Power Automate, keeping the URL private server-side.

const UNSUBSCRIBE_ENDPOINT =
  "https://defaultea77fe37fd2c429487c38746bce662.5a.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/157f4562e92f4baea0d033bd5d633eb8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=6Q-n-5Au4JSQPvvwuqLoVNSIf6Ml3wo0R1inlLkLGjk";

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

    const response = await fetch(UNSUBSCRIBE_ENDPOINT, {
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
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ success: false, message: "Unsubscription failed" });
  }
}
