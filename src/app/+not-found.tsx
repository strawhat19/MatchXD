import { router } from 'expo-router';
import { Page, Button, EmptyState } from '../components/ui';

export default function NotFound() {
  return <Page title="A Wrong Turn"><EmptyState icon="compass" title="This Page Has Moved" description="Your next connection is still out there." action={<Button label="Back To Discover" onPress={() => router.replace(`/discover`)} />} /></Page>;
}
