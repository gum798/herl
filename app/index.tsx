import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Show onboarding screen for first-time users
  return <Redirect href="/(tabs)/chat" />;
}
