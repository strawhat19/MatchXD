import { Redirect, useLocalSearchParams } from 'expo-router';

export const OnboardingRedirect = () => {
  const params = useLocalSearchParams();
  return <Redirect href={{ pathname: `/onboarding`, params }} />;
};
