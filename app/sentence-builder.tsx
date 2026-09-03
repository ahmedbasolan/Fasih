import { useLocalSearchParams, router } from 'expo-router';
import { SentenceBuilder } from '../src/screens/SentenceBuilder';

export default function SentenceBuilderRoute() {
  const { pattern } = useLocalSearchParams<{ pattern?: string }>();
  return (
    <SentenceBuilder
      initialPatternId={typeof pattern === 'string' ? pattern : null}
      onExit={() => router.back()}
    />
  );
}