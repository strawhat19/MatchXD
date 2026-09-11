import './CommunityStats.css';
import { CountUp } from './CountUp';
import { Icon } from '../../components/Icon';
import { XoToken } from '../../components/XoToken';
import { PUBLIC_STATISTICS, PLACEHOLDER_PUBLIC_STATISTICS, type PublicStatistics } from '../../data/publicStatistics';

const statisticsLabels = [
  { key: `xoxos`, label: `XOs` },
  { key: `users`, label: `Users`, icon: `users` },
  { key: `likes`, label: `Likes`, icon: `heart` },
  { key: `matches`, label: `Matches`, icon: `link` },
] as const;

export const CommunityStats = ({ placeholders = false, statistics = PUBLIC_STATISTICS }: { placeholders?: boolean; statistics?: PublicStatistics }) => {
  const totals = placeholders ? PLACEHOLDER_PUBLIC_STATISTICS : statistics;
  return <section className="mx-community-stats" aria-label={placeholders ? `Sample community statistics` : `MatchXD community statistics`}>
    <dl className="mx-community-stats-row">{statisticsLabels.map(statistic => <div key={statistic.key} className="mx-community-stat"><dt>{statistic.key === `xoxos` ? <span className="mx-community-xos"><XoToken size={24} label={statistic.label} decorative={false} /><span aria-hidden="true">s</span></span> : <><span className="mx-community-stat-icon" aria-hidden="true"><Icon name={statistic.icon} size={16} color="#17191f" /></span><span>{statistic.label}</span></>}</dt><dd><CountUp value={totals[statistic.key]} /></dd></div>)}</dl>
  </section>;
};
