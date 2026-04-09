export interface Blog {
  id: string;
  user_id: string;
  youtube_url: string;
  video_id: string;
  title: string;
  description: string;
  hashtags: string[];
  transcript: string | null;
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateBlogRequest {
  youtube_url: string;
}

export interface GenerateBlogResponse {
  blog: Blog;
}

export interface ApiError {
  error: string;
}
