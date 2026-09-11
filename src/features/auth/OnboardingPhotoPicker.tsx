import { Image } from 'expo-image';
import { File } from 'expo-file-system';
import { Icon } from '../../components/Icon';
import * as ImagePicker from 'expo-image-picker';
import { uniqueId } from '../../domain/identity';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../theme/ThemeProvider';
import { ProfilePhoto } from '../../components/ProfilePhoto';
import { Txt, Row, Field, Button } from '../../components/ui';
import { View, Platform, Pressable, StyleSheet } from 'react-native';
import { profilePhotosDirectory } from '../../storage/profilePhotos';
import { avatarOptions, isProfileAvatar, isStoredProfilePhoto } from '../../domain/avatars';

type Props = { photo: string; onChange: (photo: string) => void; onBusyChange?: (busy: boolean) => void };
type Candidate = { uri: string; operation: number; status: `loading` | `ready` };

export const OnboardingPhotoPicker = ({ photo, onChange, onBusyChange }: Props) => {
  const { colors } = useTheme();
  const mounted = useRef(true);
  const request = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [url, setUrl] = useState(``);
  const [error, setError] = useState(``);
  const [focused, setFocused] = useState(``);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [mode, setMode] = useState<`url` | `avatars` | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [busy, setBusy] = useState<`camera` | `upload` | null>(null);
  const working = !!busy || candidate?.status === `loading`;
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; stream.current?.getTracks().forEach(track => track.stop()); };
  }, []);
  useEffect(() => { onBusyChange?.(working); return () => onBusyChange?.(false); }, [working, onBusyChange]);
  useEffect(() => {
    if (candidate?.status !== `loading`) return;
    const timeout = setTimeout(() => {
      if (request.current !== candidate.operation) return;
      request.current++;
      setCandidate(null);
      setError(`The Image Took Too Long To Load — Try Another URL`);
    }, 15000);
    return () => clearTimeout(timeout);
  }, [candidate]);
  const closeCamera = () => {
    request.current++;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    setCameraOpen(false);
    setCameraReady(false);
    setBusy(null);
  };
  const selectFile = async (source: `camera` | `upload`) => {
    if (working) return;
    const operation = ++request.current;
    setBusy(source);
    setError(``);
    setMode(null);
    setCandidate(null);
    let selected = false;
    let savedFile: File | undefined;
    let asset: ImagePicker.ImagePickerAsset | undefined;
    try {
      if (source === `camera` && Platform.OS !== `web`) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          if (mounted.current && request.current === operation) setError(permission.canAskAgain ? `Allow Camera Access To Take A Photo, Or Upload One Instead` : `Enable Camera Access In Your Device Settings, Or Upload A Photo`);
          return;
        }
      }
      if (!mounted.current || request.current !== operation) return;
      const options: ImagePicker.ImagePickerOptions = { quality: 0.8, base64: true, aspect: [1, 1], allowsEditing: true, mediaTypes: [`images`], cameraType: ImagePicker.CameraType.front };
      const result = source === `camera` ? await ImagePicker.launchCameraAsync(options) : await ImagePicker.launchImageLibraryAsync(options);
      asset = result.assets?.[0];
      if (!mounted.current || request.current !== operation || result.canceled) return;
      if (!asset?.base64 || asset.type === `video` || !asset.width || !asset.height) { setError(`That Image Could Not Be Opened — Try A JPG, PNG Or WebP File`); return; }
      const mime = asset.base64.startsWith(`/9j/`) ? `jpeg` : asset.base64.startsWith(`iVBORw0KGgo`) ? `png` : asset.base64.startsWith(`UklGR`) ? `webp` : ``;
      if (!mime) { setError(`Use A JPG, PNG Or WebP Image`); return; }
      const uri = `data:image/${mime};base64,${asset.base64}`;
      if (!isStoredProfilePhoto(uri)) { setError(`Choose An Image Smaller Than 2 MB`); return; }
      if (Platform.OS !== `web`) {
        const directory = profilePhotosDirectory();
        directory.create({ idempotent: true });
        savedFile = new File(directory, `${uniqueId(`ProfilePhoto`)}.${mime === `jpeg` ? `jpg` : mime}`);
        savedFile.write(asset.base64, { encoding: `base64` });
      }
      if (!mounted.current || request.current !== operation) return;
      onChange(savedFile?.uri ?? uri);
      selected = true;
      setMode(null);
    } catch {
      if (mounted.current && request.current === operation) setError(source === `camera` ? `Camera Could Not Be Opened — Check Permissions Or Upload A Photo` : `Photo Could Not Be Opened — Try Another File`);
    } finally {
      if (savedFile && !selected) {
        try { if (savedFile.exists) savedFile.delete(); }
        catch { if (mounted.current && request.current === operation) setError(`Photo Could Not Be Saved — Try Again`); }
      }
      if (Platform.OS === `web` && asset?.uri?.startsWith(`blob:`)) URL.revokeObjectURL(asset.uri);
      if (mounted.current && request.current === operation) setBusy(null);
    }
  };
  const openCamera = async () => {
    if (Platform.OS !== `web`) { await selectFile(`camera`); return; }
    if (working) return;
    setError(``);
    if (!globalThis.navigator?.mediaDevices?.getUserMedia) { setError(`Camera Access Requires A Supported Browser And HTTPS — You Can Upload A Photo Instead`); return; }
    const operation = ++request.current;
    setBusy(`camera`);
    setMode(null);
    setCandidate(null);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: `user`, width: { ideal: 1280 }, height: { ideal: 1280 } } });
      if (!mounted.current || request.current !== operation) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media;
      setCameraOpen(true);
    } catch (problem) {
      if (!mounted.current || request.current !== operation) return;
      setBusy(null);
      const name = problem instanceof Error ? problem.name : ``;
      setError(name === `NotAllowedError` ? `Allow Camera Access In Your Browser Settings, Or Upload A Photo` : name === `NotFoundError` ? `No Camera Was Found — Upload A Photo Or Choose An Avatar` : `Camera Is Unavailable — Close Other Camera Apps Or Upload A Photo`);
    }
  };
  const capturePhoto = () => {
    const camera = video.current;
    if (!cameraReady || !camera?.videoWidth || !camera.videoHeight) return;
    try {
      const canvas = document.createElement(`canvas`);
      const crop = Math.min(camera.videoWidth, camera.videoHeight);
      canvas.width = canvas.height = Math.min(crop, 1024);
      const context = canvas.getContext(`2d`);
      if (!context) throw new Error(`Camera Capture Unavailable`);
      context.drawImage(camera, (camera.videoWidth - crop) / 2, (camera.videoHeight - crop) / 2, crop, crop, 0, 0, canvas.width, canvas.height);
      const uri = canvas.toDataURL(`image/jpeg`, 0.82);
      if (!isStoredProfilePhoto(uri)) { setError(`Photo Could Not Be Saved — Try Uploading An Image Under 2 MB`); return; }
      onChange(uri);
      setMode(null);
      closeCamera();
    } catch { setError(`Photo Could Not Be Captured — Try Again Or Upload An Image`); }
  };
  const previewUrl = () => {
    if (working) return;
    setError(``);
    try {
      const parsed = new URL(url.trim());
      if (parsed.protocol !== `https:` || !parsed.hostname.includes(`.`) || parsed.username || parsed.password || parsed.href.length > 2048) throw new Error(`Invalid URL`);
      setCandidate({ uri: parsed.href, operation: ++request.current, status: `loading` });
    } catch { setError(`Enter A Complete HTTPS Image URL, Such As https://example.com/photo.jpg`); }
  };
  const showMode = (next: typeof mode) => { request.current++; setMode(next === mode ? null : next); setError(``); setCandidate(null); };
  return <View style={styles.stack}>
    <Row style={styles.previewRow}>
      <View style={[styles.preview, { backgroundColor: colors.raised, borderColor: colors.border }]}>
        {photo ? <ProfilePhoto photo={photo} /> : <Icon name={`camera`} size={30} color={colors.muted} />}
      </View>
      <View style={styles.description}>
        <Txt size={18} weight={`semibold`}>{photo ? isProfileAvatar(photo) ? `Your Avatar` : `Looking Like You` : `Make It Yours`}</Txt>
        <Txt size={13} color={colors.muted}>Take a photo, add one you love, or express yourself with an avatar.</Txt>
        {!!photo && <Pressable accessibilityRole={`button`} accessibilityLabel={`Remove Selected Photo Or Avatar`} disabled={working} onPress={() => { onChange(``); setError(``); }} style={styles.remove}><Txt size={12} color={colors.accentText} weight={`medium`}>Remove</Txt></Pressable>}
      </View>
    </Row>
    <View style={styles.actions}>
      <Button label={`Take Photo`} icon={`camera`} variant={`secondary`} disabled={working} style={styles.action} onPress={() => void openCamera()} />
      <Button label={`Upload Photo`} icon={`upload`} variant={`secondary`} disabled={working} style={styles.action} onPress={() => void selectFile(`upload`)} />
      <Button label={`Image URL`} icon={`link`} variant={`secondary`} disabled={working} style={styles.action} onPress={() => showMode(`url`)} />
      <Button label={`Choose Avatar`} icon={`smile`} variant={`secondary`} disabled={working} style={styles.action} onPress={() => showMode(`avatars`)} />
    </View>
    <Txt size={12} color={colors.muted}>Uploads: JPG, PNG or WebP · Up to 2 MB · Saved on this device</Txt>
    {busy && !cameraOpen && <Row style={styles.progress}><Txt size={13} color={colors.muted}>{busy === `camera` ? `Opening Camera…` : `Opening Photos…`}</Txt><Button label={`Cancel`} variant={`ghost`} onPress={closeCamera} /></Row>}
    {Platform.OS === `web` && cameraOpen && <View style={[styles.editor, { borderColor: colors.border, backgroundColor: colors.raised }]}>
      <Txt weight={`medium`}>Camera Preview</Txt>
      <video autoPlay muted playsInline aria-label={`Live Camera Preview`} onLoadedData={() => setCameraReady(true)} ref={element => {
        video.current = element;
        if (!element || element.srcObject === stream.current) return;
        const activeStream = stream.current;
        element.srcObject = activeStream;
        void element.play().catch(() => { if (mounted.current && stream.current === activeStream && video.current === element) { setError(`Camera Preview Could Not Start — Try Again Or Upload A Photo`); closeCamera(); } });
      }} style={{ width: `100%`, maxHeight: 280, aspectRatio: `1`, objectFit: `cover`, borderRadius: 14, transform: `scaleX(-1)`, background: `#17191F` }} />
      <Row style={styles.wrap}><Button label={`Capture Photo`} icon={`camera`} disabled={!cameraReady} onPress={capturePhoto} /><Button label={`Cancel`} variant={`ghost`} onPress={closeCamera} /></Row>
    </View>}
    {mode === `avatars` && <View style={[styles.editor, { borderColor: colors.border, backgroundColor: colors.raised }]}>
      <Txt weight={`medium`}>Pick Your Personality</Txt>
      <View style={styles.avatars}>{avatarOptions.map(avatar => <Pressable key={avatar.id} accessibilityRole={`button`} accessibilityLabel={`${avatar.label} Avatar`} accessibilityState={{ selected: photo === avatar.id }} disabled={working} onFocus={() => setFocused(avatar.id)} onBlur={() => setFocused(``)} onPress={() => { onChange(avatar.id); setError(``); }} style={({ pressed }) => [styles.avatarOption, { opacity: pressed ? 0.7 : 1 }]}>
        <View style={[styles.avatar, { borderColor: photo === avatar.id || focused === avatar.id ? colors.accent : `transparent` }]}><ProfilePhoto photo={avatar.id} style={styles.avatarImage} />{photo === avatar.id && <View style={[styles.selected, { backgroundColor: colors.accent }]}><Icon name={`check`} size={12} color={colors.onAccent} /></View>}</View>
        <Txt size={11} color={photo === avatar.id ? colors.accentText : colors.muted} weight={photo === avatar.id ? `semibold` : `regular`}>{avatar.label}</Txt>
      </Pressable>)}</View>
    </View>}
    {mode === `url` && <View style={[styles.editor, { borderColor: colors.border, backgroundColor: colors.raised }]}>
      <Field autoFocus label={`HTTPS Image URL`} value={url} maxLength={2048} editable={!working} autoCorrect={false} autoCapitalize={`none`} keyboardType={`url`} placeholder={`https://example.com/your-photo.jpg`} returnKeyType={`go`} onSubmitEditing={previewUrl} onChangeText={value => { request.current++; setUrl(value); setCandidate(null); setError(``); }} />
      <Txt size={12} color={colors.muted}>Use a direct image link that stays publicly accessible.</Txt>
      {candidate && <View style={styles.urlPreview}>
        <Image key={candidate.operation} source={{ uri: candidate.uri }} contentFit={`cover`} accessibilityLabel={`Image URL Preview`} style={styles.urlImage} onLoad={() => { if (mounted.current && request.current === candidate.operation) setCandidate(current => current?.operation === candidate.operation ? { ...current, status: `ready` } : current); }} onError={() => { if (!mounted.current || request.current !== candidate.operation) return; request.current++; setCandidate(null); setError(`This Link Could Not Load An Image — Check The URL Or Upload A Photo`); }} />
        <Txt size={12} color={colors.muted}>{candidate.status === `ready` ? `Ready To Use` : `Checking Image…`}</Txt>
      </View>}
      <Row style={styles.wrap}>
        {candidate?.status === `ready` ? <Button label={`Use This Photo`} icon={`check`} onPress={() => { onChange(candidate.uri); showMode(null); }} /> : <Button label={`Preview Image`} icon={`image`} variant={`secondary`} disabled={working || !url.trim()} onPress={previewUrl} />}
        <Button label={`Cancel`} variant={`ghost`} onPress={() => showMode(null)} />
      </Row>
    </View>}
    {!!error && <Txt size={13} color={colors.danger} accessibilityRole={`alert`}>{error}</Txt>}
  </View>;
};

const styles = StyleSheet.create({
  stack: { gap: 14 },
  description: { flex: 1, gap: 4 },
  wrap: { gap: 10, flexWrap: `wrap` },
  previewRow: { gap: 18, alignItems: `center` },
  remove: { minHeight: 28, alignSelf: `flex-start`, justifyContent: `center` },
  action: { flexGrow: 1, flexBasis: `44%`, paddingHorizontal: 12 },
  actions: { gap: 10, flexWrap: `wrap`, flexDirection: `row` },
  progress: { gap: 8, flexWrap: `wrap`, justifyContent: `space-between` },
  editor: { gap: 14, padding: 16, borderRadius: 18, borderWidth: 1 },
  urlPreview: { gap: 6, alignItems: `center`, alignSelf: `flex-start` },
  urlImage: { width: 112, height: 112, borderRadius: 18 },
  avatars: { gap: 10, flexDirection: `row`, flexWrap: `wrap` },
  avatarOption: { gap: 4, alignItems: `center`, minWidth: 66 },
  avatarImage: { width: 58, height: 58, borderRadius: 29 },
  avatar: { padding: 3, borderWidth: 2, borderRadius: 36 },
  selected: { width: 20, height: 20, right: -1, bottom: 0, borderRadius: 10, position: `absolute`, alignItems: `center`, justifyContent: `center` },
  preview: { width: 96, height: 96, borderRadius: 28, borderWidth: 1, overflow: `hidden`, alignItems: `center`, justifyContent: `center` },
});
