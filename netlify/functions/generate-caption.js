import { Configuration, OpenAIApi } from "openai";

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST supported." });
  }

  const { image_urls } = req.body;

  if (!Array.isArray(image_urls) || image_urls.length === 0) {
    return res.status(400).json({ error: "No image URLs provided." });
  }

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  });
  const openai = new OpenAIApi(configuration);

  try {
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
        content: [
          ...image_urls.map(url => ({ type: "image_url", image_url: { url } }))
        ]
      }
    ];

    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 300
    });

    const caption = response.data.choices[0].message.content.trim();
    res.status(200).json({ caption });
  } catch (err) {
    console.error(err.response?.data || err.message || err);
    res.status(500).json({ error: "Failed to generate caption." });
  }
};
