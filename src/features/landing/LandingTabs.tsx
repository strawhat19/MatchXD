import { Pressable, StyleSheet, View } from 'react-native';
import { Txt } from '../../components/ui';
import { LANDING_VIEWS, LANDING_VIEW_LABELS, type LandingTabsProps } from './LandingTabs.types';

export const LandingTabs = ({ value, onChange, scope }: LandingTabsProps) => <View accessibilityRole="tablist" accessibilityLabel={`${scope === `features` ? `Features` : `Pricing`} view`} style={styles.tabs}>
  {LANDING_VIEWS.map(view => <Pressable key={view} accessibilityRole="tab" accessibilityState={{ selected: value === view }} onPress={() => onChange(view)} style={[styles.tab, value === view && styles.selected]}><Txt size={13} weight="medium" color={value === view ? `#FFFFFF` : `#17191F`}>{LANDING_VIEW_LABELS[view]}</Txt></Pressable>)}
</View>;

const styles = StyleSheet.create({
  tabs: { alignSelf: `flex-start`, flexDirection: `row`, gap: 4, padding: 4, marginBottom: 22, borderWidth: 1, borderColor: `#17191F26`, borderRadius: 30, backgroundColor: `#FFFFFF66` },
  tab: { minWidth: 90, minHeight: 44, paddingHorizontal: 22, alignItems: `center`, justifyContent: `center`, borderRadius: 25 },
  selected: { backgroundColor: `#17191F` },
});
