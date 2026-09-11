import './CommunityStats.css';
import { CountUp } from './CountUp';
import { XoToken } from '../../components/XoToken';
import { PUBLIC_STATISTICS, PLACEHOLDER_PUBLIC_STATISTICS, type PublicStatistics } from '../../data/publicStatistics';

const statisticsLabels = [
  { key: `xoxos`, label: `XOs` },
  { key: `users`, label: `User’s` },
  { key: `likes`, label: `Likes` },
  { key: `matches`, label: `Matches` },
] as const;

export const CommunityStats = ({ placeholders = false, statistics = PUBLIC_STATISTICS }: { placeholders?: boolean; statistics?: PublicStatistics }) => {
  const totals = placeholders ? PLACEHOLDER_PUBLIC_STATISTICS : statistics;
  return <section className="mx-community-stats" aria-label={placeholders ? `Sample community statistics` : `MatchXD community statistics`}>
    <dl className="mx-community-stats-row">{statisticsLabels.map(statistic => <div key={statistic.key} className="mx-community-stat"><dt>{statistic.key === `xoxos` ? <XoToken size={24} label={statistic.label} decorative={false} /> : statistic.label}</dt><dd><CountUp value={totals[statistic.key]} /></dd></div>)}</dl>
    {placeholders ? <p className="mx-community-stats-preview">Sample statistics</p> : null}
  </section>;
};
