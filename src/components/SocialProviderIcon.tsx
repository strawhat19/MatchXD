import { Platform } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

// Font Awesome v4.7.0 SVG glyphs; see THIRD_PARTY_NOTICES.md.
const providerPaths = {
  google: { width: 1536, path: `M768 750h725q12 -67 12 -128q0 -217 -91 -387.5t-259.5 -266.5t-386.5 -96q-157 0 -299 60.5t-245 163.5t-163.5 245t-60.5 299t60.5 299t163.5 245t245 163.5t299 60.5q300 0 515 -201l-209 -201q-123 119 -306 119q-129 0 -238.5 -65t-173.5 -176.5t-64 -243.5 t64 -243.5t173.5 -176.5t238.5 -65q87 0 160 24t120 60t82 82t51.5 87t22.5 78h-436v264z` },
  apple: { width: 1408, path: `M1393 321q-39 -125 -123 -250q-129 -196 -257 -196q-49 0 -140 32q-86 32 -151 32q-61 0 -142 -33q-81 -34 -132 -34q-152 0 -301 259q-147 261 -147 503q0 228 113 374q113 144 284 144q72 0 177 -30q104 -30 138 -30q45 0 143 34q102 34 173 34q119 0 213 -65 q52 -36 104 -100q-79 -67 -114 -118q-65 -94 -65 -207q0 -124 69 -223t158 -126zM1017 1494q0 -61 -29 -136q-30 -75 -93 -138q-54 -54 -108 -72q-37 -11 -104 -17q3 149 78 257q74 107 250 148q1 -3 2.5 -11t2.5 -11q0 -4 0.5 -10t0.5 -10z` },
  facebook: { width: 1024, path: `M959 1524v-264h-157q-86 0 -116 -36t-30 -108v-189h293l-39 -296h-254v-759h-306v759h-255v296h255v218q0 186 104 288.5t277 102.5q147 0 228 -12z` },
  phone: { width: 1408, path: `M1408 296q0 -27 -10 -70.5t-21 -68.5q-21 -50 -122 -106q-94 -51 -186 -51q-27 0 -53 3.5t-57.5 12.5t-47 14.5t-55.5 20.5t-49 18q-98 35 -175 83q-127 79 -264 216t-216 264q-48 77 -83 175q-3 9 -18 49t-20.5 55.5t-14.5 47t-12.5 57.5t-3.5 53q0 92 51 186 q56 101 106 122q25 11 68.5 21t70.5 10q14 0 21 -3q18 -6 53 -76q11 -19 30 -54t35 -63.5t31 -53.5q3 -4 17.5 -25t21.5 -35.5t7 -28.5q0 -20 -28.5 -50t-62 -55t-62 -53t-28.5 -46q0 -9 5 -22.5t8.5 -20.5t14 -24t11.5 -19q76 -137 174 -235t235 -174q2 -1 19 -11.5t24 -14 t20.5 -8.5t22.5 -5q18 0 46 28.5t53 62t55 62t50 28.5q14 0 28.5 -7t35.5 -21.5t25 -17.5q25 -15 53.5 -31t63.5 -35t54 -30q70 -35 76 -53q3 -7 3 -21z` },
} as const;

export const SocialProviderIcon = ({ name, size = 21, color }: { name: keyof typeof providerPaths; size?: number; color: string }) => {
  const icon = providerPaths[name];
  return <Svg width={size * icon.width / 1792} height={size} viewBox={`0 0 ${icon.width} 1792`} accessible={Platform.OS === `web` ? undefined : false} aria-hidden={true} focusable={false} style={{ flexShrink: 0 }}><G transform={`translate(0 1536) scale(1 -1)`}><Path d={icon.path} fill={color} /></G></Svg>;
};
