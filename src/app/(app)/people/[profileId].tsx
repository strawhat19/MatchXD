import { useLocalSearchParams } from 'expo-router';
import { PersonScreen } from '../../../features/discovery/DiscoverScreen';

export default function PersonRoute() {
  const { profileId } = useLocalSearchParams<{ profileId: string }>();
  return <PersonScreen profileId={profileId} />;
}
