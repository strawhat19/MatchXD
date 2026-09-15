import { Platform } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import Svg, { Path, Ellipse } from 'react-native-svg';

export const SPARK_PATH = `M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93`;
const HEART_PATH = `M16 28.2C15.4 28.2 14.8 28 14.3 27.6L5.4 19.2C2.7 16.7 1.3 14.1 1.3 11.2C1.3 6.6 4.7 3.2 9.1 3.2C12 3.2 14.1 4.4 15.3 6Q16 6.9 16.7 6C17.9 4.4 20 3.2 22.9 3.2C27.3 3.2 30.7 6.6 30.7 11.2C30.7 14.1 29.3 16.7 26.6 19.2L17.7 27.6C17.2 28 16.6 28.2 16 28.2Z`;

export const SymbolIcon = ({ name, size = 21, color }: { name: `spark` | `heart` | `coffee` | `arrow-left-right`; size?: number; color?: string }) => {
  const { colors } = useTheme();
  const ink = color ?? colors.text;
  return <Svg width={size} height={size} viewBox={name === `heart` ? `0 0 32 32` : `0 0 24 24`} fill={`none`} accessible={Platform.OS === `web` ? undefined : false} aria-hidden={true} focusable={false} style={{ flexShrink: 0 }}>
    {name === `spark` ? <Path d={SPARK_PATH} stroke={ink} strokeWidth={2.5} /> : name === `heart` ? <Path d={HEART_PATH} fill={ink} /> : name === `arrow-left-right` ? <Path d={`M4 12h16M8 8l-4 4 4 4m8-8 4 4-4 4`} stroke={ink} strokeWidth={2} strokeLinecap={`round`} strokeLinejoin={`round`} /> : <>
      <Ellipse cx={11} cy={20} rx={10} ry={2} fill={`#B8C0C7`} />
      <Path d={`M17 9h2a3 3 0 0 1 0 6h-2`} stroke={`#A2ADB6`} strokeWidth={2} />
      <Path d={`M4 8h14v6a7 7 0 0 1-14 0Z`} fill={`#F8FAFC`} stroke={`#A2ADB6`} strokeWidth={1.2} />
      <Ellipse cx={11} cy={8} rx={7} ry={2} fill={`#6B422C`} stroke={`#D7DDE2`} strokeWidth={1.2} />
      <Path d={`M8 5c-2-2 2-2 0-4m6 4c-2-2 2-2 0-4`} stroke={`#929DA5`} strokeWidth={1.3} strokeLinecap={`round`} />
    </>}
  </Svg>;
};
