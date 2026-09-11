import { useState } from 'react';
import { router } from 'expo-router';
import { Icon } from '../../components/Icon';
import { hasTier } from '../../config/plans';
import { View, StyleSheet } from 'react-native';
import { useApp } from '../../state/AppProvider';
import { useTheme } from '../../theme/ThemeProvider';
import { discoveryProfiles } from '../../domain/matching';
import { OPTIONS, ATTRIBUTE_LABELS } from '../../config/app';
import { Attribute, Preferences, PlanId } from '../../domain/types';
import { Txt, Page, Panel, Button, Field, Chip, Row } from '../../components/ui';

const requiredPlan: Partial<Record<Attribute, PlanId>> = { ethnicity: `m`, height: `mx`, salary: `mx` };

export const PreferencesScreen = () => {
  const { state, act } = useApp();
  const { colors } = useTheme();
  const [draft, setDraft] = useState<Preferences>({ ...state.preferences, attributes: { ...state.preferences.attributes } });
  const [ageMin, setAgeMin] = useState(`${draft.ageMin}`);
  const [ageMax, setAgeMax] = useState(`${draft.ageMax}`);
  const [distance, setDistance] = useState(`${draft.distance}`);
  const [hiddenNames, setHiddenNames] = useState(draft.hiddenNames.join(`, `));
  const [error, setError] = useState(``);
  const toggle = (attribute: Attribute, option: string) => {
    const current = draft.attributes[attribute];
    setDraft({ ...draft, attributes: { ...draft.attributes, [attribute]: current.includes(option) ? current.filter(value => value !== option) : [...current, option] } });
  };
  const clearAll = () => {
    setDraft({ ageMin: 18, ageMax: 99, distance: 100, hiddenNames: [], attributes: Object.fromEntries(Object.keys(OPTIONS).map(key => [key, [] as string[]])) as Preferences[`attributes`] });
    setAgeMin(`18`); setAgeMax(`99`); setDistance(`100`); setHiddenNames(``); setError(``);
  };
  const save = () => {
    const min = Number(ageMin), max = Number(ageMax), miles = Number(distance);
    if (!Number.isInteger(min) || !Number.isInteger(max) || min < 18 || max > 100 || max < min) { setError(`Choose An Age Range Between 18 And 100`); return; }
    if (!Number.isInteger(miles) || miles < 1 || miles > 500) { setError(`Choose A Distance Between 1 And 500 Miles`); return; }
    const preferences = { ...draft, ageMin: min, ageMax: max, distance: miles, hiddenNames: [...new Set(hiddenNames.split(`,`).map(value => value.trim()).filter(Boolean))] };
    const result = act({ type: `save-preferences`, preferences });
    if (result.ok) { setError(``); router.push(`/discover`); }
    else setError(result.message || `Preferences Could Not Be Saved`);
  };
  const preview = { ...draft, ageMin: Number(ageMin), ageMax: Number(ageMax), distance: Number(distance), hiddenNames: hiddenNames.split(`,`).map(value => value.trim()).filter(Boolean) };
  const count = discoveryProfiles({ ...state, preferences: preview }).length;
  return <Page title={`Your Kind Of Connection`} subtitle={`A few preferences. Plenty of possibility.`} action={<Button label={`Reset Filters`} variant={`ghost`} onPress={clearAll} />}>
    <View style={styles.stack}>
      <Panel style={[styles.tip, { backgroundColor: colors.pale }]}><Icon name={`sliders`} size={23} color={colors.accent} /><View style={styles.grow}><Txt weight={`semibold`}>{count} Profile{count === 1 ? `` : `s`} In Your Remaining Deck</Txt><Txt size={12} color={colors.muted}>“Any” includes everyone. “Not Provided” includes only profiles without that detail.</Txt></View></Panel>
      <Panel style={styles.section}>
        <Txt size={21} weight={`semibold`}>Start With The Basics</Txt>
        <View style={styles.fields}>
          <View style={styles.column}><Field label={`Minimum Age`} value={ageMin} keyboardType={`number-pad`} maxLength={3} onChangeText={setAgeMin} /></View>
          <View style={styles.column}><Field label={`Maximum Age`} value={ageMax} keyboardType={`number-pad`} maxLength={3} onChangeText={setAgeMax} /></View>
          <View style={styles.column}><Field label={`Distance · Miles`} value={distance} keyboardType={`number-pad`} maxLength={3} onChangeText={setDistance} /></View>
        </View>
        <Txt size={12} color={colors.muted}>Distances are approximate.</Txt>
      </Panel>
      {(Object.keys(OPTIONS) as Attribute[]).map(attribute => {
        const tier = requiredPlan[attribute];
        const locked = !!tier && !hasTier(state.wallet.plan, tier);
        const options = [...new Set([...OPTIONS[attribute], `Not Provided`])];
        return <Panel key={attribute} style={styles.section}>
          <Row style={styles.spread}><Txt size={19} weight={`semibold`}>{ATTRIBUTE_LABELS[attribute]}</Txt>{tier && <Chip label={`${tier.toUpperCase()} Plan`} selected={!locked} onPress={() => router.push(`/wallet`)} />}</Row>
          {locked && <Row style={styles.lock}><Icon name={`lock`} color={colors.muted} size={14} /><Txt color={colors.muted} size={12}>Available With {tier?.toUpperCase()} · This Filter Is Currently Inactive</Txt></Row>}
          <Row style={styles.wrap}>
            <Chip label={`Any`} disabled={locked} selected={!draft.attributes[attribute].length} onPress={() => setDraft({ ...draft, attributes: { ...draft.attributes, [attribute]: [] } })} />
            {options.map(option => <Chip key={option} label={option} disabled={locked} selected={draft.attributes[attribute].includes(option)} onPress={() => toggle(attribute, option)} />)}
          </Row>
          {attribute === `height` && <Txt size={12} color={colors.muted}>Height is self-reported.</Txt>}
        </Panel>;
      })}
      <Panel style={styles.section}>
        <Txt size={21} weight={`semibold`}>Names You’d Rather Skip</Txt>
        <Field label={`Excluded First Names · Comma Separated`} value={hiddenNames} onChangeText={setHiddenNames} placeholder={`Alex, Jamie`} maxLength={500} />
        <Txt size={12} color={colors.muted}>An exact name match hides that person from your discovery deck. This is a personal filter, not a block. Use Block on a profile to hide each other throughout the app.</Txt>
      </Panel>
      {!!error && <Txt color={colors.danger}>{error}</Txt>}
      <Row style={styles.footer}><Button label={`Save Preferences`} icon={`check`} onPress={save} /></Row>
    </View>
  </Page>;
};

const styles = StyleSheet.create({
  stack: { gap: 20 },
  grow: { flex: 1, gap: 4 },
  lock: { gap: 8, flexWrap: `wrap` },
  wrap: { gap: 8, flexWrap: `wrap` },
  section: { gap: 17, padding: 22 },
  column: { flex: 1, minWidth: 110 },
  footer: { justifyContent: `flex-end`, paddingVertical: 10 },
  fields: { gap: 16, flexDirection: `row`, flexWrap: `wrap` },
  spread: { justifyContent: `space-between`, gap: 12, flexWrap: `wrap` },
  tip: { gap: 16, padding: 22, flexDirection: `row`, alignItems: `center` },
});
