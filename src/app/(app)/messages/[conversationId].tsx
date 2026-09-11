import { useLocalSearchParams } from 'expo-router';
import { ConversationScreen } from '../../../features/messaging/ConversationScreen';

export default function ConversationRoute() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  return <ConversationScreen profileId={conversationId} />;
}
