export async function handler(event) {
  const resumeUrl = event.queryStringParameters.url;

  if (!resumeUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing ?url=" }),
    };
  }

  try {
    const res = await fetch(resumeUrl, { method: "GET" });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: "Failed to resume Wait node" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "✅ Draft resumed!" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}