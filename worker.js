/* ==========================================================================
   A-AI Cloudflare Workers Router Proxy
   ========================================================================== */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    try {
      const body = await request.json();
      const GROQ_API_KEY = env.GROQ_API_KEY;

      if (!GROQ_API_KEY) {
        return new Response(JSON.stringify({ error: "Groq API key not configured on worker environment" }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        });
      }

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: body.model || "llama-3.1-8b-instant",
          messages: body.messages || [],
          stream: body.stream || false,
          temperature: body.temperature ?? 0.3
        })
      });

      const responseHeaders = new Headers();
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));
      
      const contentType = groqResponse.headers.get("content-type");
      if (contentType) {
        responseHeaders.set("content-type", contentType);
      }

      return new Response(groqResponse.body, {
        status: groqResponse.status,
        headers: responseHeaders
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }
};
