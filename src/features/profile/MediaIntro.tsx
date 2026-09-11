import { useEvent } from 'expo';
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Button, Panel, Txt } from '../../components/ui';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const AudioIntro = ({ uri }: { uri: string }) => {
  const player = useAudioPlayer(uri === `demo:voice` ? require('../../../assets/media/intro.wav') : uri);
  const status = useAudioPlayerStatus(player);
  const { colors } = useTheme();
  const [error, setError] = useState(``);
  const togglePlayback = async () => {
    try {
      setError(``);
      if (status.playing) { player.pause(); return; }
      if (status.didJustFinish || status.currentTime >= status.duration) await player.seekTo(0);
      player.play();
    } catch { setError(`Audio Could Not Be Played`); }
  };
  return <Panel style={styles.audio}>
    <View style={styles.audioCopy}>
      <Txt weight={`semibold`}>A Little Hello</Txt>
      <Txt size={12} color={error || status.error ? colors.danger : colors.muted}>{error || (status.error ? `Audio Could Not Be Loaded On This Device` : status.isLoaded ? `${Math.floor(status.currentTime)} / ${Math.floor(status.duration)} seconds` : `Loading Audio…`)}</Txt>
    </View>
    <Button icon={status.playing ? `pause` : `play`} label={status.playing ? `Pause` : `Play`} variant={`secondary`} disabled={!status.isLoaded || !!status.error} onPress={() => void togglePlayback()} />
  </Panel>;
};

const VideoIntro = ({ uri }: { uri: string }) => {
  const player = useVideoPlayer(uri === `demo:video` ? require('../../../assets/media/intro.mp4') : uri);
  const { status } = useEvent(player, `statusChange`, { status: player.status });
  const { colors } = useTheme();
  return <View style={styles.stack}><VideoView player={player} nativeControls contentFit={`contain`} style={styles.video} />{status === `error` && <Txt color={colors.danger}>This Video Could Not Be Played On This Device</Txt>}</View>;
};

export const MediaIntro = ({ voiceUri, videoUri }: { voiceUri?: string; videoUri?: string }) => <View style={styles.stack}>
  {!!voiceUri && <AudioIntro uri={voiceUri} />}
  {!!videoUri && <VideoIntro uri={videoUri} />}
</View>;

const styles = StyleSheet.create({
  stack: { gap: 14 },
  audioCopy: { flex: 1, gap: 4 },
  video: { width: `100%`, height: 260, borderRadius: 18, backgroundColor: `#15161B` },
  audio: { padding: 16, gap: 12, alignItems: `center`, flexDirection: `row` },
});
