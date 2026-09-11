import { router } from 'expo-router';
import { Page } from '../../components/ui';
import { ProfileForm } from './ProfileForm';
import { useApp } from '../../state/AppProvider';

export const EditProfileScreen = () => {
  const { state, act } = useApp();
  return <Page title={`Edit Profile`} subtitle={`Show up as yourself. That’s the best part.`}>
    <ProfileForm profile={state.user} onCancel={() => router.back()} onSave={profile => {
      const result = act({ type: `save-user`, profile });
      if (result.ok) router.replace(`/profile`);
      else return result.message;
    }} />
  </Page>;
};
