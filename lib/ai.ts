import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface BlogContent {
  title: string;
  description: string;
  hashtags: string[];
}

const SYSTEM_PROMPT = `You are an expert blog content writer and SEO specialist. 
Given a YouTube video transcript, you create engaging, high-quality blog content.
You always respond with valid JSON only — no markdown, no explanation, just the JSON object.`;

/**
 * Generate a blog title, description, and hashtags from a YouTube transcript
 * using Claude AI.
 */
export async function generateBlogContent(
  transcript: string,
  youtubeUrl: string
): Promise<BlogContent> {
  const prompt = `Here is a YouTube video transcript. Generate a complete blog post from it.

YouTube URL: ${youtubeUrl}

Transcript:
${transcript}

Respond ONLY with a JSON object in this exact format:
{
  "title": "A compelling, SEO-optimized blog post title (max 80 characters)",
  "description": "A comprehensive blog post description (400-600 words). Write in a clear, engaging style. Include the key points from the video, organized into logical paragraphs. Do NOT include markdown formatting — plain text only.",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"]
}

Rules:
- Title: compelling, specific, SEO-friendly, max 80 chars
- Description: 400-600 words, plain text, well-structured paragraphs
- Hashtags: exactly 10 tags, lowercase, no # symbol, relevant to the content
- Output ONLY valid JSON, nothing else`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const rawText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');

  // Strip any accidental markdown code fences
  const jsonText = rawText.replace(/```json\n?|```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(jsonText) as BlogContent;

    // Validate shape
    if (!parsed.title || !parsed.description || !Array.isArray(parsed.hashtags)) {
      throw new Error('Invalid response shape from Claude');
    }

    // Sanitize hashtags — lowercase, strip # if present
    parsed.hashtags = parsed.hashtags
      .map((tag) => tag.replace(/^#/, '').toLowerCase().trim())
      .filter(Boolean)
      .slice(0, 15);

    return parsed;
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${jsonText.slice(0, 200)}`);
  }
}
