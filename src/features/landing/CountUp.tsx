import { Text } from 'react-native';

export type CountUpProps = { value: number };

export const CountUp = ({ value }: CountUpProps) => <Text>{Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0}</Text>;
