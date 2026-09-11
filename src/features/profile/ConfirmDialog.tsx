import { useTheme } from '../../theme/ThemeProvider';
import { Modal, View, StyleSheet } from 'react-native';
import { Txt, Button, Row } from '../../components/ui';

type Props = { visible: boolean; title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void };

export const ConfirmDialog = ({ visible, title, description, confirmLabel, onCancel, onConfirm }: Props) => {
  const { colors } = useTheme();
  return <Modal visible={visible} transparent animationType={`fade`} onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View accessibilityViewIsModal style={[styles.dialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Txt size={23} weight={`bold`}>{title}</Txt>
        <Txt color={colors.muted}>{description}</Txt>
        <Row style={styles.actions}>
          <Button label={`Keep It`} variant={`secondary`} onPress={onCancel} />
          <Button label={confirmLabel} variant={`danger`} onPress={onConfirm} />
        </Row>
      </View>
    </View>
  </Modal>;
};

const styles = StyleSheet.create({
  overlay: { flex: 1, padding: 24, justifyContent: `center`, alignItems: `center`, backgroundColor: `rgba(0,0,0,0.6)` },
  dialog: { width: `100%`, maxWidth: 430, gap: 16, padding: 26, borderWidth: 1, borderRadius: 24 },
  actions: { gap: 12, justifyContent: `flex-end`, flexWrap: `wrap`, marginTop: 8 },
});
