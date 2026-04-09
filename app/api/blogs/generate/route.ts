import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { extractVideoId, fetchTranscript, getThumbnailUrl } from '@/lib/youtube';
import { generateBlogContent } from '@/lib/ai';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request body
    const body = await req.json();
    const { youtube_url } = body as { youtube_url: string };

    if (!youtube_url || typeof youtube_url !== 'string') {
      return NextResponse.json({ error: 'youtube_url is required' }, { status: 400 });
    }

    // 3. Extract video ID
    const videoId = extractVideoId(youtube_url.trim());
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL. Please provide a valid YouTube video link.' },
        { status: 400 }
      );
    }

    // 4. Fetch transcript
    const transcript = await fetchTranscript(videoId);

    // 5. Generate blog content with Claude
    const { title, description, hashtags } = await generateBlogContent(
      transcript,
      youtube_url
    );

    // 6. Save to Supabase
    const supabase = createServerSupabaseClient();
    const { data: blog, error: dbError } = await supabase
      .from('blogs')
      .insert({
        user_id: userId,
        youtube_url: youtube_url.trim(),
        video_id: videoId,
        title,
        description,
        hashtags,
        transcript,
        thumbnail: getThumbnailUrl(videoId),
      })
      .select()
      .single();

    if (dbError) {
      console.error('Supabase insert error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save blog. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ blog }, { status: 201 });
  } catch (err) {
    console.error('Blog generation error:', err);
    const message =
      err instanceof Error ? err.message : 'An unexpected error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET all blogs for the authenticated user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }

    return NextResponse.json({ blogs });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
