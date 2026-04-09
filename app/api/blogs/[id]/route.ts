import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', params.id)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
