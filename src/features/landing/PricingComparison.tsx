import type { ReactNode } from 'react';
import { Txt } from '../../components/ui';
import { Icon } from '../../components/Icon';
import { PLANS, PLAN_ORDER } from '../../config/plans';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { comparisonCellFor, PLAN_LIMITS_NOTE, PLAN_COMPARISON_ROWS, PLAN_COMPARISON_NOTE, PLAN_COMPARISON_INTRO, PLAN_COMPARISON_TITLE, PLAN_COMPARISON_CURRENCY_NOTE, type PlanComparisonCell } from '../../config/planComparison';

const ink = `#17191F`;
const muted = `#62606B`;
const accent = `#A92341`;
const ComparisonValue = ({ cell, daily }: { cell: PlanComparisonCell; daily: boolean }) => cell.kind === `value` ? <View style={styles.value}><Txt size={daily ? 26 : 14} weight="semibold" color={daily ? accent : ink}>{cell.label}</Txt>{cell.detail ? <Txt size={10} color={muted}>{cell.detail}</Txt> : null}</View> : cell.kind === `included` ? <View style={styles.check}><Icon name="check" size={15} color={accent} /></View> : <Txt size={17} color={muted}>—</Txt>;

export const PricingComparison = ({ children, tableLegend = true }: { children?: ReactNode; tableLegend?: boolean }) => {
  const { width } = useWindowDimensions();
  const tableWidth = Math.max(640, Math.min(width - 48, 1180));
  const labelWidth = tableWidth * .3;
  return <View style={styles.section}>
    <View style={styles.inner}>
      <View style={styles.heading}><Txt size={10} weight="medium" color={accent} style={styles.eyebrow}>THE GOOD STUFF, SIDE BY SIDE</Txt><Txt accessibilityRole="header" size={27} weight="semibold" color={ink} style={styles.title}>{PLAN_COMPARISON_TITLE}</Txt><Txt size={12} color={muted}>{PLAN_COMPARISON_INTRO}</Txt></View>
      {children}
      {width - 48 < tableWidth ? <View style={styles.hint}><Icon name="move" size={16} color={accent} /><Txt size={11} color={muted}>Swipe to compare all four plans</Txt></View> : null}
      <View style={styles.tableFrame}>
        <ScrollView horizontal showsHorizontalScrollIndicator persistentScrollbar nestedScrollEnabled bounces={false} style={styles.scroller} accessibilityLabel="Plan services comparison. Swipe horizontally to compare Free, M, MX, and MXD.">
          <View style={{ width: tableWidth }}>
            <View style={[styles.row, styles.tableHead]}><View style={[styles.labelCell, { width: labelWidth }]}><Txt size={12} weight="semibold" color={ink}>What’s included</Txt></View>{PLAN_ORDER.map(plan => <View key={plan} style={styles.planCell}><Txt accessibilityRole="header" size={14} weight="semibold" color={ink}>{PLANS[plan].name}</Txt><Txt size={20} weight="semibold" color={ink} style={{ marginTop: 4, letterSpacing: -.5 }}>{`$${(PLANS[plan].price / 100).toFixed(2)}`}</Txt><Txt size={10} color={muted}>USD / month</Txt></View>)}</View>
            {PLAN_COMPARISON_ROWS.map((row, index) => <View key={row.id} style={[styles.row, { backgroundColor: row.kind === `daily` ? `#FFE8EF` : index % 2 ? `#FFF1F5` : `#FFF8FA`, borderBottomWidth: index === PLAN_COMPARISON_ROWS.length - 1 ? 0 : 1 }]}>
              <View style={[styles.labelCell, { width: labelWidth }]}><Txt size={12} weight="medium" color={ink}>{row.label}</Txt><Txt size={10} color={muted} style={{ marginTop: 5 }}>{row.description}</Txt></View>
              {PLAN_ORDER.map(plan => {
                const cell = comparisonCellFor(row, plan);
                return <View key={plan} accessible accessibilityLabel={`${PLANS[plan].name}, ${row.label}: ${cell.label}${cell.detail ? ` ${cell.detail}` : ``}`} style={styles.planCell}><ComparisonValue cell={cell} daily={row.kind === `daily`} /></View>;
              })}
            </View>)}
          </View>
        </ScrollView>
      </View>
      <View style={styles.notes}><Txt size={10} color={muted}>{PLAN_LIMITS_NOTE}</Txt>{tableLegend ? <><View style={styles.legend}><View style={styles.legendItem}><Icon name="check" size={13} color={accent} /><Txt size={10} color={muted}>Included</Txt></View><Txt size={10} color={muted}>— Not included</Txt><Txt size={10} color={muted}>XO costs shown per use</Txt></View><Txt size={10} color={muted}>{PLAN_COMPARISON_NOTE}</Txt><Txt size={10} color={muted}>{PLAN_COMPARISON_CURRENCY_NOTE}</Txt></> : null}</View>
    </View>
  </View>;
};

const styles = StyleSheet.create({
  value: { alignItems: `center` },
  title: { letterSpacing: -.8, lineHeight: 35 },
  eyebrow: { letterSpacing: 1.8 },
  heading: { gap: 9, maxWidth: 550 },
  tableHead: { backgroundColor: `#FFDAE4` },
  scroller: { flexGrow: 0, width: `100%` },
  notes: { gap: 11, paddingHorizontal: 2 },
  hint: { gap: 8, alignItems: `center`, flexDirection: `row` },
  legend: { gap: 15, flexWrap: `wrap`, flexDirection: `row` },
  legendItem: { gap: 6, alignItems: `center`, flexDirection: `row` },
  inner: { gap: 18, width: `100%`, maxWidth: 1180, alignSelf: `center` },
  section: { width: `100%`, paddingVertical: 48, paddingHorizontal: 24, backgroundColor: `#FFE8EE` },
  row: { minHeight: 76, alignItems: `stretch`, flexDirection: `row`, borderBottomWidth: 1, borderColor: `#EAD5DC` },
  tableFrame: { width: `100%`, borderWidth: 1, borderRadius: 18, borderColor: `#DCBCC5`, overflow: `hidden`, backgroundColor: `#FFF8FA` },
  planCell: { flex: 1, padding: 12, alignItems: `center`, justifyContent: `center` },
  labelCell: { padding: 16, justifyContent: `center`, borderRightWidth: 1, borderRightColor: `#EAD5DC` },
  check: { width: 25, height: 25, borderRadius: 20, alignItems: `center`, justifyContent: `center`, backgroundColor: `#FFDAE4` },
});
