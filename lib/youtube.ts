import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Extract the YouTube video ID from any YouTube URL format:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/shorts/VIDEO_ID
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Fetch the transcript for a YouTube video.
 * Returns the full transcript text, or throws if unavailable.
 */
export async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    const fullText = transcriptItems
      .map((item) => item.text)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!fullText) {
      throw new Error('Transcript is empty');
    }

    // Limit to ~12,000 words to stay within Claude context limits
    const words = fullText.split(' ');
    if (words.length > 12000) {
      return words.slice(0, 12000).join(' ') + '...';
    }

    return fullText;
  } catch (err) {
    throw new Error(
      `Could not fetch transcript for video ${videoId}. The video may not have captions enabled. ` +
        (err instanceof Error ? err.message : String(err))
    );
  }
}

/**
 * Get the YouTube thumbnail URL for a video ID.
 */
export function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
