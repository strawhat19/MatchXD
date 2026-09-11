import './PricingComparison.css';
import { useId, type ReactNode } from 'react';
import { XoCopy } from '../../components/XoToken';
import { PLANS, PLAN_ORDER } from '../../config/plans';
import { comparisonCellFor, PLAN_LIMITS_NOTE, PLAN_COMPARISON_ROWS, PLAN_COMPARISON_NOTE, PLAN_COMPARISON_INTRO, PLAN_COMPARISON_TITLE, PLAN_COMPARISON_CURRENCY_NOTE } from '../../config/planComparison';

export const PricingComparison = ({ children, tableLegend = true }: { children?: ReactNode; tableLegend?: boolean }) => {
  const id = useId();
  return <section className="mx-comparison" aria-labelledby={`${id}-heading`}>
    <div className="mx-comparison-heading"><div><span className="mx-comparison-eyebrow mx-reveal mx-reveal-item">THE GOOD STUFF, SIDE BY SIDE</span><h3 className="mx-reveal mx-reveal-item" id={`${id}-heading`}>{PLAN_COMPARISON_TITLE}</h3><p className="mx-reveal mx-reveal-item">{PLAN_COMPARISON_INTRO}</p></div></div>
    {children}
    <span className="mx-comparison-scroll-hint" id={`${id}-scroll`}><span aria-hidden="true">↔</span> Scroll to compare all four plans</span>
    <div className="mx-comparison-scroll" role="region" aria-label="Plan comparison table" aria-describedby={tableLegend ? `${id}-scroll ${id}-limits ${id}-note ${id}-currency-note` : `${id}-scroll ${id}-limits`} tabIndex={0}>
      <table className="mx-comparison-table">
        <caption className="mx-comparison-sr">Included services, separate daily action limits, and XO costs by MatchXD plan. Matched chats are free and unlimited. Prices are shown in the plan cards above.</caption>
        <colgroup><col className="mx-comparison-feature-col" />{PLAN_ORDER.map(plan => <col key={plan} className="mx-comparison-plan-col" />)}</colgroup>
        <thead><tr><th scope="col">What’s included</th>{PLAN_ORDER.map(plan => <th scope="col" key={plan}>{PLANS[plan].name}</th>)}</tr></thead>
        <tbody>{PLAN_COMPARISON_ROWS.map(row => <tr key={row.id} className={row.id === `daily` ? `mx-comparison-daily` : undefined}>
          <th scope="row"><span><XoCopy size={14}>{row.label}</XoCopy></span><small><XoCopy size={12}>{row.description}</XoCopy></small></th>
          {PLAN_ORDER.map(plan => {
            const cell = comparisonCellFor(row, plan);
            return <td key={plan}>{cell.kind === `value` ? <span className="mx-comparison-value"><XoCopy size={16}>{cell.label}</XoCopy>{cell.detail ? <small><XoCopy size={12}>{cell.detail}</XoCopy></small> : null}</span> : <><span aria-hidden="true" className={cell.kind === `included` ? `mx-comparison-check` : `mx-comparison-dash`}>{cell.kind === `included` ? `✓` : `—`}</span><span className="mx-comparison-sr">{cell.label}</span></>}</td>;
          })}
        </tr>)}</tbody>
      </table>
    </div>
    <div className="mx-comparison-notes"><p id={`${id}-limits`}><XoCopy size={13}>{PLAN_LIMITS_NOTE}</XoCopy></p>{tableLegend ? <><p className="mx-comparison-legend"><span><b aria-hidden="true">✓</b> Included</span><span><b aria-hidden="true">—</b> Not included</span><span><XoCopy size={13}>XO costs shown per use</XoCopy></span></p><p id={`${id}-note`}><XoCopy size={13}>{PLAN_COMPARISON_NOTE}</XoCopy></p><p id={`${id}-currency-note`}><XoCopy size={13}>{PLAN_COMPARISON_CURRENCY_NOTE}</XoCopy></p></> : null}</div>
  </section>;
};
