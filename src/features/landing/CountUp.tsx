import { Text } from 'react-native';
import { formatCount } from './CountUp.shared';

export type CountUpProps = { value: number };

export const CountUp = ({ value }: CountUpProps) => <Text>{formatCount(Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0)}</Text>;
