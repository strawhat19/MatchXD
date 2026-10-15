import { Link } from 'expo-router';
import { Page, Panel, Txt, Button } from '../components/ui';
export default function PasswordReset() {
  return <Page title={`Reset Password`} subtitle={`Email authentication is not connected.`}><Panel><Txt>No password or email address is requested. This local preview has no online password to reset.</Txt><Button label={`Reset unavailable until connected`} disabled onPress={() => undefined} /><Link href={`/sign-in`}>Back to sign-in</Link><Link href={`/sign-up`}>Create a local preview profile</Link></Panel></Page>;
}
