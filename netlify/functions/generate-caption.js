const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Only POST supported." })
    };
  }

  try {
    const { image_urls } = JSON.parse(event.body);

    if (!Array.isArray(image_urls) || image_urls.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No image URLs provided." })
      };
    }

    const messages = [
      {
        role: "system",
        content: `You are a landscape design marketing writer. Your job is to write short but vivid captions that:
- Celebrate the craftsmanship and visual appeal of the uploaded images
- Sound proud, creative, and local — never salesy
- Mention one clear functional OR visual benefit
- Use at most one emoji, only if it matches the scene
- Use present tense, first-person plural ("we", "our")
- Start with an upbeat hook (e.g., “Love how…”, “There’s nothing like…”)
- Use at most one exclamation mark
- Give a concrete benefit (e.g., drainage, curb appeal, low-maintenance color)
- If possible, name specific plants or materials (e.g., Drift Roses, flagstone)
- End each sentence with a period and newline
- Add one blank line at the end
- Add exactly one hashtag line in this format:
  #Superscapes <featureTag> #LandscapeDesign
  – use one of #Landscapes #Hardscapes #Waterscapes #Colorscapes if clearly applicable; otherwise omit <featureTag>.
- Output only the caption, no extra explanation or markdown.`
      },
      {
        role: "user",
        content: image_urls.map((url) => ({
          type: "image_url",
          image_url: { url }
        }))
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 300
    });

    const caption = response.choices[0].message.content.trim();

    return {
      statusCode: 200,
      body: JSON.stringify({ caption })
    };
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Caption generation failed." })
    };
  }
};
