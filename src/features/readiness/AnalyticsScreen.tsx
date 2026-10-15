import { useState } from 'react';
import { View } from 'react-native';
import { useApp } from '../../state/AppProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { connectionStatus } from '../../shared/readiness/status';
import { Page, Panel, Txt, Row, Chip, EmptyState } from '../../components/ui';

export const AnalyticsScreen = () => {
  const { state } = useApp();
  const { colors } = useTheme();
  const [dataset, setDataset] = useState(`Traffic`);
  if (state.session?.role !== `owner`) return <Page title={`Analytics Preview`}><EmptyState icon={`lock`} title={`Owner layout preview only`} description={`Use the explicit Owner Preview entry on sign-in. It grants no live access or permissions.`} /></Page>;
  const localCounts = [
    [`Sample profiles`, state.profiles.length],
    [`Demo matches`, state.matches.length],
    [`Local reports`, state.reports.length],
  ];
  return <Page title={`Analytics Preview`} subtitle={`Local demo activity and disconnected provider-report layouts.`}>
    <View nativeID={`matchxd-analytics`} style={{ gap: 20 }}>
      <Panel><Txt weight={`semibold`}>Preview, not owner authentication</Txt><Txt color={colors.muted}>This device's demo role is not a security boundary. No real user records or private provider metrics are available.</Txt></Panel>
      <Row style={{ flexWrap: `wrap` }}>{[`Traffic`, `Runtime`, `Local activity`].map(value => <Chip key={value} label={value} selected={dataset === value} onPress={() => setDataset(value)} />)}</Row>
      {dataset === `Local activity` ? <Panel><Txt weight={`semibold`}>{connectionStatus.source} · current snapshot</Txt>{localCounts.map(([label, count]) => <Row key={label} style={{ justifyContent: `space-between` }}><Txt>{label}</Txt><Txt weight={`bold`}>{count}</Txt></Row>)}<Txt size={12} color={colors.muted}>These are not visitors, active users, paid customers or real moderation totals.</Txt></Panel> : <Panel><Txt size={24} weight={`bold`}>{dataset} · —</Txt><Txt color={colors.muted}>{connectionStatus.reports}: authorized server-side reporting is not connected. No chart values, percentages or health scores are fabricated.</Txt><Row style={{ flexWrap: `wrap` }}>{[`7 days`, `30 days`, `Chart`, `List`, `Refresh`, `Export`].map(label => <Chip key={label} label={label} disabled />)}</Row><Txt size={12} color={colors.muted}>Controls become available only when a verified provider report supplies a source, time range, coverage and freshness.</Txt></Panel>}
    </View>
  </Page>;
};
