import { supabase } from './supabase';
import { summarizeConversation } from './summarizer';
import type { ChatMessage, Conversation, PersonaPresetId } from '../types';

/**
 * Save a conversation to Supabase.
 * Creates the conversation record and all its messages.
 */
export async function saveConversation(
  conversation: Conversation,
  messages: ChatMessage[],
): Promise<string | null> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('Not authenticated, skipping sync');
      return null;
    }

    // Generate summary
    const { summary, mood } = await summarizeConversation(messages);

    // Insert conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({
        id: conversation.id,
        user_id: user.id,
        started_at: conversation.startedAt.toISOString(),
        ended_at: new Date().toISOString(),
        summary,
        mood,
      })
      .select('id')
      .single();

    if (convError) {
      console.error('Failed to save conversation:', convError);
      return null;
    }

    // Insert messages in batch
    const messageRows = messages.map((m) => ({
      conversation_id: convData.id,
      role: m.role,
      content: m.content,
      has_image: m.hasImage ?? false,
      image_url: m.imageUri ?? null,
      created_at: m.createdAt.toISOString(),
    }));

    const { error: msgError } = await supabase
      .from('messages')
      .insert(messageRows);

    if (msgError) {
      console.error('Failed to save messages:', msgError);
      return null;
    }

    console.log(`Conversation ${convData.id} synced with ${messages.length} messages`);
    return convData.id;
  } catch (error) {
    console.error('Sync error:', error);
    return null;
  }
}

/**
 * Fetch conversation history from Supabase.
 */
export async function fetchConversations(
  limit: number = 20,
  offset: number = 0,
): Promise<Array<{
  id: string;
  summary: string;
  mood: string;
  startedAt: string;
  messageCount: number;
}>> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select('id, summary, mood, started_at, messages(count)')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch conversations:', error);
      return [];
    }

    return (data || []).map((conv: any) => ({
      id: conv.id,
      summary: conv.summary || 'No summary',
      mood: conv.mood || '',
      startedAt: conv.started_at,
      messageCount: conv.messages?.[0]?.count || 0,
    }));
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

/**
 * Upsert the user's persona settings to Supabase profiles.
 * No-op when the user is not authenticated.
 */
export async function savePersonaToCloud(params: {
  companionName: string;
  personaPresetId: PersonaPresetId;
  personaCustomPrompt: string;
}): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          companion_name: params.companionName,
          persona_preset_id: params.personaPresetId,
          persona_custom_prompt: params.personaCustomPrompt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

    if (error) {
      console.error('Failed to save persona:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('savePersonaToCloud error:', error);
    return false;
  }
}

/**
 * Fetch the user's persona settings from Supabase.
 * Returns null when not authenticated or on error.
 */
export async function loadPersonaFromCloud(): Promise<{
  companionName: string;
  personaPresetId: PersonaPresetId;
  personaCustomPrompt: string;
} | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('companion_name, persona_preset_id, persona_custom_prompt')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) return null;

    return {
      companionName: data.companion_name ?? 'HERL',
      personaPresetId: (data.persona_preset_id ?? 'default') as PersonaPresetId,
      personaCustomPrompt: data.persona_custom_prompt ?? '',
    };
  } catch (error) {
    console.error('loadPersonaFromCloud error:', error);
    return null;
  }
}

/**
 * Fetch messages for a specific conversation.
 */
export async function fetchConversationMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }

    return (data || []).map((m: any) => ({
      id: m.id,
      conversationId: m.conversation_id,
      role: m.role,
      content: m.content,
      hasImage: m.has_image,
      imageUri: m.image_url,
      createdAt: new Date(m.created_at),
    }));
  } catch (error) {
    console.error('Fetch messages error:', error);
    return [];
  }
}
