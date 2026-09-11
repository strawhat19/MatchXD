import { PlanId } from '../../domain/types';
import { Icon } from '../../components/Icon';
import { ECONOMY } from '../../config/economy';
import { useApp } from '../../state/AppProvider';
import { useEffect, useRef, useState } from 'react';
import { XoToken } from '../../components/XoToken';
import { useTheme } from '../../theme/ThemeProvider';
import { PLANS, PLAN_ORDER } from '../../config/plans';
import { nextResetAt, walletTotal } from '../../domain/wallet';
import { Button, Chip, EmptyState, Page, Panel, Row, Txt } from '../../components/ui';
import { Modal, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { planActionAllowances, PLAN_INTRO_NOTE, PLAN_LIMITS_NOTE, PLAN_MATCHED_CHAT } from '../../config/planComparison';

type Checkout = { kind: `plan`; plan: PlanId } | { kind: `pack`; cents: number; xo: number };
const dollars = (cents: number) => new Intl.NumberFormat(`en-US`, { style: `currency`, currency: `USD` }).format(cents / 100);

export const WalletScreen = () => {
  const { state, act } = useApp();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const checkoutLock = useRef(false);
  const rewardLock = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  const [notice, setNotice] = useState(``);
  const [failed, setFailed] = useState(false);
  const [claimingReward, setClaimingReward] = useState(false);
  const [checkout, setCheckout] = useState<Checkout | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [tab, setTab] = useState<`plans` | `history`>(`plans`);
  const { wallet } = state;
  const current = PLANS[wallet.plan];
  const remaining = Math.max(0, Math.ceil((nextResetAt(new Date(now)).getTime() - now) / 60000));
  const resetLabel = `${Math.floor(remaining / 60)}h ${remaining % 60}m`;
  const showResult = (ok: boolean, message: string) => { setFailed(!ok); setNotice(message); };
  const openCheckout = (value: Checkout) => { checkoutLock.current = false; setCheckout(value); };

  useEffect(() => {
    const timer = setInterval(() => { setNow(Date.now()); act({ type: `refresh` }); }, 30000);
    return () => clearInterval(timer);
  }, [act]);

  const confirmCheckout = () => {
    if (!checkout || checkoutLock.current) return;
    checkoutLock.current = true;
    const operationId = `checkout_${Date.now()}_${Math.random()}`;
    const result = checkout.kind === `plan` ? act({ type: `upgrade`, plan: checkout.plan, operationId }) : act({ type: `purchase`, cents: checkout.cents, operationId });
    showResult(result.ok, result.message ?? (result.ok ? checkout.kind === `plan` ? `Plan Updated — No Charge Made` : `XOs Added — No Charge Made` : `Checkout Could Not Be Completed`));
    setCheckout(null);
  };
  const cancelPlan = () => {
    const result = act({ type: `cancel-plan` });
    showResult(result.ok, result.message ?? (result.ok ? `Cancellation Scheduled` : `Plan Could Not Be Canceled`));
    setConfirmCancel(false);
  };
  const reward = () => {
    if (rewardLock.current) return;
    rewardLock.current = true;
    setClaimingReward(true);
    const result = act({ type: `ad-reward`, operationId: `ad_${Date.now()}_${Math.random()}` });
    showResult(result.ok, result.message ?? (result.ok ? `Reward Added` : `Reward Could Not Be Added`));
    setTimeout(() => { rewardLock.current = false; setClaimingReward(false); }, 350);
  };

  return <Page title="More Possibilities. Fairer Prices." subtitle="Your connections should feel premium. Your bill shouldn’t.">
    <Panel style={{ backgroundColor: colors.pale, gap: 22 }}>
      <Row style={{ justifyContent: `space-between` }}><Txt size={13} weight="semibold" color={colors.accentText}>YOUR XO WALLET</Txt><Chip label={`${current.name} Plan`} selected /></Row>
      <Row style={{ alignItems: `baseline`, flexWrap: `wrap` }}><Txt size={54} weight="bold" style={{ letterSpacing: -2 }}>{walletTotal(wallet)}</Txt><Txt size={21} weight="semibold" color={colors.accentText}>XOs</Txt><Txt color={colors.muted}>Ready For A Connection</Txt></Row>
      <View style={[styles.balanceGrid, { borderTopColor: colors.border }]}>
        <View style={{ flex: 1, minWidth: 100, gap: 4 }}><Txt size={23} weight="semibold">{wallet.daily}</Txt><Txt size={12} color={colors.muted}>Daily Balance</Txt></View>
        <View style={{ flex: 1, minWidth: 100, gap: 4 }}><Txt size={23} weight="semibold">{wallet.purchased}</Txt><Txt size={12} color={colors.muted}>Purchased · No Expiry</Txt></View>
        <View style={{ flex: 1, minWidth: 130, gap: 4 }}><Txt size={23} weight="semibold">{resetLabel}</Txt><Txt size={12} color={colors.muted}>Until Daily Reset</Txt></View>
      </View>
      <Txt size={12} color={colors.muted}>Your {current.daily} daily XOs reset at midnight New York time. Unused daily XOs expire. Daily XOs are used before purchased XOs.</Txt>
      <View style={{ gap: 9 }}><Txt size={14} weight="semibold">{current.name} Daily Limits</Txt>{planActionAllowances(wallet.plan).map(action => <Row key={action.id} style={{ justifyContent: `space-between`, flexWrap: `wrap`, gap: 4 }}><Txt size={12} color={colors.muted}>{action.label}</Txt><Txt size={12} weight="medium">{action.limit} / day · {action.cost} XO each</Txt></Row>)}<Txt size={12} weight="semibold">{PLAN_MATCHED_CHAT}</Txt><Txt size={11} color={colors.muted}>{PLAN_LIMITS_NOTE}</Txt><Txt size={11} color={colors.muted}>{PLAN_INTRO_NOTE}</Txt></View>
    </Panel>
    {notice ? <Panel style={{ borderColor: failed ? colors.danger : colors.success }}><Row><Icon name={failed ? `alert-circle` : `check-circle`} color={failed ? colors.danger : colors.success} size={18} /><Txt style={{ flex: 1 }} color={failed ? colors.danger : colors.text}>{notice}</Txt></Row></Panel> : null}
    <Row><Chip label="Plans & XOs" selected={tab === `plans`} onPress={() => setTab(`plans`)} /><Chip label="Wallet History" selected={tab === `history`} onPress={() => setTab(`history`)} /></Row>
    {tab === `plans` ? <>
      <View style={{ gap: 6 }}><Txt size={23} weight="semibold">A Little Extra Goes A Long Way</Txt><Txt color={colors.muted}>Straightforward monthly plans. All prices in USD.</Txt></View>
      <View style={styles.planGrid}>{PLAN_ORDER.map(planId => {
        const plan = PLANS[planId];
        const selected = wallet.plan === planId;
        const included = PLAN_ORDER.indexOf(planId) < PLAN_ORDER.indexOf(wallet.plan);
        return <Panel key={planId} style={{ width: width >= 1450 ? `23.3%` : width >= 750 ? `48.5%` : `100%`, gap: 18, borderColor: planId === `mx` ? colors.accent : colors.border }}>
          <Row style={{ justifyContent: `space-between` }}><Txt size={26} weight="bold">{plan.name}</Txt>{planId === `mx` ? <Txt size={10} weight="semibold" color={colors.accentText}>SWEET SPOT</Txt> : selected ? <Txt size={10} weight="semibold" color={colors.accentText}>YOUR PLAN</Txt> : null}</Row>
          <View><Row style={{ gap: 4, alignItems: `baseline` }}><Txt size={31} weight="bold">{dollars(plan.price)}</Txt><Txt size={12} color={colors.muted}>/ month</Txt></Row><Txt size={12} color={colors.muted}>{plan.description}</Txt></View>
          <View style={[styles.dailyBadge, { backgroundColor: colors.pale }]}><Txt size={21} weight="semibold" color={colors.accentText}>{plan.daily}</Txt><Txt size={12} color={colors.accentText}>Daily XOs</Txt></View>
          <View style={{ gap: 11, flex: 1 }}><Row style={{ gap: 8 }}><Icon name="check" color={colors.success} size={15} /><Txt size={12} style={{ flex: 1 }}>{PLAN_MATCHED_CHAT}</Txt></Row>{planActionAllowances(planId).map(action => <View key={action.id} style={{ gap: 2 }}><Txt size={12} weight="medium">{action.limit} {action.label.toLowerCase()} / day</Txt><Txt size={11} color={colors.muted}>{action.cost} XO each · Separate limit</Txt></View>)}{plan.features.map(feature => <Row key={feature} style={{ gap: 8 }}><Icon name="check" color={colors.success} size={15} /><Txt size={12} style={{ flex: 1 }}>{feature}</Txt></Row>)}</View>
          <Button label={selected ? wallet.cancelAt ? `Keep ${plan.name}` : `Current Plan` : included ? `Included In Your Plan` : `Try ${plan.name}`} variant={planId === `mx` ? `primary` : `secondary`} disabled={(selected && !wallet.cancelAt) || included || planId === `free`} onPress={() => openCheckout({ kind: `plan`, plan: planId })} />
        </Panel>;
      })}</View>
      {wallet.plan !== `free` ? <Panel style={{ gap: 14 }}><Row style={{ justifyContent: `space-between`, flexWrap: `wrap` }}><View style={{ flex: 1 }}><Txt weight="semibold">{wallet.cancelAt ? `Cancellation Scheduled` : `Your Plan, On Your Terms`}</Txt><Txt size={12} color={colors.muted}>{wallet.cancelAt ? `Your ${current.name} access continues until ${new Date(wallet.cancelAt).toLocaleDateString(undefined, { month: `long`, day: `numeric`, year: `numeric` })}. Then your plan returns to Free.` : `Cancel any time. Your current access stays until the billing period ends.`}</Txt></View>{!wallet.cancelAt ? <Button label="Cancel Plan" variant="ghost" onPress={() => setConfirmCancel(true)} /> : null}</Row>{confirmCancel ? <View style={{ gap: 12 }}><Txt>Schedule cancellation of your {current.name} plan?</Txt><Row style={{ flexWrap: `wrap` }}><Button label="Confirm Cancellation" variant="danger" onPress={cancelPlan} /><Button label="Keep My Plan" variant="secondary" onPress={() => setConfirmCancel(false)} /></Row></View> : null}</Panel> : null}
      <View style={{ gap: 5 }}><Txt size={23} weight="semibold">Keep A Few Extra Hellos Handy</Txt><Txt color={colors.muted}>Purchased XOs never expire. {ECONOMY.xoPerDollar} XOs per $1, in every pack.</Txt><Txt size={12} color={colors.muted}>Packs add to your balance. They don’t increase your daily action limits.</Txt></View>
      <View style={styles.planGrid}>{ECONOMY.packs.map(pack => <Panel key={pack.cents} style={{ gap: 18, width: width >= 850 ? `31.8%` : `100%` }}><Row><View style={[styles.packIcon, { backgroundColor: colors.pale }]}><XoToken size={32} /></View><View><Txt size={23} weight="semibold" decorateXo={false} accessibilityLabel={`${pack.xo} XOs`}>{pack.xo}</Txt><Txt color={colors.muted}>{dollars(pack.cents)} · One-Time</Txt></View></Row><Button label={`Get ${dollars(pack.cents)} Pack`} variant="secondary" onPress={() => openCheckout({ kind: `pack`, ...pack })} /></Panel>)}</View>
      <Panel><Row style={{ flexWrap: `wrap`, justifyContent: `space-between` }}><View style={{ gap: 6, flex: 1, minWidth: 190 }}><Txt size={18} weight="semibold">A Little Boost, On Us</Txt><Txt color={colors.muted}>Claim {ECONOMY.ads.reward} daily XOs. {wallet.adCount} of {ECONOMY.ads.limit} rewards used today.</Txt><Txt size={11} color={colors.muted}>Ads are not connected yet. This reward is available without watching a video.</Txt></View><Button icon="play" label={wallet.adCount >= ECONOMY.ads.limit ? `All Rewards Claimed` : `Claim Reward`} disabled={wallet.adCount >= ECONOMY.ads.limit || claimingReward} variant="secondary" onPress={reward} /></Row></Panel>
      <Panel><Txt size={17} weight="semibold">Small Actions. Simple Costs.</Txt><View style={{ gap: 10 }}>{[[`Pass / Like`, `${ECONOMY.costs.pass} / ${ECONOMY.costs.like} XO`], ...planActionAllowances(wallet.plan).map(action => [action.label, `${action.cost} XO each · ${action.limit} / day`]), [`Matched Messages`, `Free · Unlimited`], [`Ask MXO`, `${ECONOMY.costs.mxo} XO`], [`Block / Report / Unmatch`, `Always Free`]].map(([label, value]) => <Row key={label} style={{ justifyContent: `space-between`, flexWrap: `wrap`, gap: 4 }}><Txt size={13} color={colors.muted}>{label}</Txt><Txt size={13} weight="medium">{value}</Txt></Row>)}</View><Txt size={11} color={colors.muted}>{PLAN_INTRO_NOTE}</Txt><Txt size={11} color={colors.muted}>A swipe that sends a like is one action. A rewind is a new action and does not refund the original swipe.</Txt></Panel>
    </> : <>
      <View style={{ gap: 5 }}><Txt size={23} weight="semibold">Every XO, Accounted For</Txt><Txt color={colors.muted}>Your daily XOs, purchases, rewards, and activity.</Txt></View>
      {wallet.ledger.length ? <Panel style={{ padding: 0, overflow: `hidden` }}>{[...wallet.ledger].reverse().map((entry, index) => <View key={entry.id} style={[styles.ledgerRow, { borderBottomColor: colors.border, borderBottomWidth: index < wallet.ledger.length - 1 ? 1 : 0 }]}><View style={[styles.ledgerIcon, { backgroundColor: entry.amount > 0 ? colors.pale : colors.raised }]}><Icon name={entry.amount > 0 ? `arrow-down-left` : `arrow-up-right`} size={17} color={entry.amount > 0 ? colors.success : colors.muted} /></View><View style={{ flex: 1, gap: 4 }}><Txt weight="medium">{entry.label}</Txt><Txt size={11} color={colors.muted}>{new Date(entry.at).toLocaleString(undefined, { month: `short`, day: `numeric`, hour: `numeric`, minute: `2-digit` })} · {entry.bucket === `daily` ? `Daily` : `Purchased`}</Txt></View><Txt size={17} weight="semibold" color={entry.amount > 0 ? colors.success : colors.text}>{entry.amount > 0 ? `+` : ``}{entry.amount}</Txt></View>)}</Panel> : <EmptyState icon="activity" title="A Fresh Start" description="Your wallet activity will appear here." />}
    </>}
    <Modal visible={checkout !== null} transparent animationType="fade" onRequestClose={() => setCheckout(null)}>
      <View style={styles.modalBackdrop}><ScrollView contentContainerStyle={styles.modalScroll}><View accessibilityViewIsModal style={[styles.checkout, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Row style={{ justifyContent: `space-between` }}><Txt size={23} weight="bold">A Little More Possibility</Txt></Row>
        <Chip label="Order Details · USD" selected />
        <View style={[styles.orderSummary, { backgroundColor: colors.raised }]}><Txt weight="semibold" size={21}>{checkout?.kind === `plan` ? `${PLANS[checkout.plan].name} Membership` : `${checkout?.xo ?? 0} XOs`}</Txt><Txt size={32} weight="bold">{checkout ? dollars(checkout.kind === `plan` ? PLANS[checkout.plan].price : checkout.cents) : ``}<Txt size={14} color={colors.muted}>{checkout?.kind === `plan` ? ` / month` : ` once`}</Txt></Txt><Txt color={colors.muted}>{checkout?.kind === `plan` ? `${PLANS[checkout.plan].daily} daily XOs with ${PLANS[checkout.plan].name} benefits` : `Added to your purchased balance, with no expiration`}</Txt></View>
        {checkout?.kind === `plan` ? <View style={{ gap: 7 }}><Txt size={12} weight="semibold">{PLAN_MATCHED_CHAT}</Txt>{planActionAllowances(checkout.plan).map(action => <Txt key={action.id} size={12} color={colors.muted}>{action.limit} {action.label.toLowerCase()} / day · {action.cost} XO each</Txt>)}</View> : null}
        <Txt color={colors.muted}>{checkout?.kind === `plan` ? `Today's XO allowance increases by the difference from your highest allowance today. Actions already used today count toward your new plan's limits. Canceling keeps access through the billing period.` : `These XOs are added to your purchased balance and never expire. Purchased XOs don’t bypass daily action limits.`}</Txt>
        <Row><Icon name="shield" color={colors.accent} size={20} /><Txt size={13} style={{ flex: 1 }}>Payments are not connected. No card details are collected and no charge is made.</Txt></Row>
        <Button label="Confirm — No Charge" icon="check" onPress={confirmCheckout} /><Button label="Maybe Later" variant="ghost" onPress={() => setCheckout(null)} />
      </View></ScrollView></View>
    </Modal>
  </Page>;
};

const styles = StyleSheet.create({
  planGrid: { gap: 18, flexWrap: `wrap`, flexDirection: `row` },
  balanceGrid: { gap: 16, paddingTop: 18, borderTopWidth: 1, flexWrap: `wrap`, flexDirection: `row` },
  dailyBadge: { gap: 5, padding: 12, borderRadius: 12, flexDirection: `row`, alignItems: `center` },
  packIcon: { width: 44, height: 44, borderRadius: 15, alignItems: `center`, justifyContent: `center` },
  ledgerIcon: { width: 37, height: 37, borderRadius: 12, alignItems: `center`, justifyContent: `center` },
  ledgerRow: { gap: 13, padding: 18, flexDirection: `row`, alignItems: `center` },
  checkout: { width: `100%`, maxWidth: 510, gap: 20, borderWidth: 1, padding: 27, borderRadius: 28 },
  orderSummary: { gap: 8, padding: 20, borderRadius: 18 },
  modalBackdrop: { flex: 1, backgroundColor: `rgba(9, 11, 17, .68)` },
  modalScroll: { flexGrow: 1, padding: 24, alignItems: `center`, justifyContent: `center` },
});
