import { Link } from 'expo-router';
import { View } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { Page, Panel, Txt, Row } from '../../components/ui';
import { publicPages, type PublicPageKey } from '../../shared/readiness/status';

export const PublicPage = ({ page }: { page: PublicPageKey }) => {
  const { colors } = useTheme();
  const content = publicPages[page];
  return <Page title={content.title} subtitle={content.description}>
    <View nativeID={`matchxd-public-${page}`} style={{ gap: 22 }}>
      <Link href={`/`} style={{ color: colors.accentText }}>← MatchXD home</Link>
      <Panel>{content.paragraphs.map((paragraph, index) => <Txt key={index} nativeID={`${page}-paragraph-${index}`}>{paragraph}</Txt>)}</Panel>
      <Row style={{ flexWrap: `wrap` }}>{Object.entries(publicPages).map(([path, item]) => <Link key={path} href={`/${path}` as never} style={{ color: colors.accentText, padding: 8 }}>{item.title}</Link>)}</Row>
      <Txt size={12} color={colors.muted}>© {new Date().getFullYear()} MatchXD · <Link href={`https://piratechs.com/`}>Piratechs</Link></Txt>
    </View>
  </Page>;
};
