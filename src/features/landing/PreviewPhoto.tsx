import { Image } from 'expo-image';

const previewPhotos: Record<string, number> = {
  zoe: require('../../../assets/profiles/previews/zoe.webp'),
  maya: require('../../../assets/profiles/previews/maya.webp'),
  nina: require('../../../assets/profiles/previews/nina.webp'),
  noah: require('../../../assets/profiles/previews/noah.webp'),
  theo: require('../../../assets/profiles/previews/theo.webp'),
  aisha: require('../../../assets/profiles/previews/aisha.webp'),
  amara: require('../../../assets/profiles/previews/amara.webp'),
  elena: require('../../../assets/profiles/previews/elena.webp'),
  ethan: require('../../../assets/profiles/previews/ethan.webp'),
  lucia: require('../../../assets/profiles/previews/lucia.webp'),
  priya: require('../../../assets/profiles/previews/priya.webp'),
  isabel: require('../../../assets/profiles/previews/isabel.webp'),
  julian: require('../../../assets/profiles/previews/julian.webp'),
  marcus: require('../../../assets/profiles/previews/marcus.webp'),
  oliver: require('../../../assets/profiles/previews/oliver.webp'),
  gabriel: require('../../../assets/profiles/previews/gabriel.webp'),
};

export const PreviewPhoto = ({ photo }: { photo: string }) => <Image
  transition={0}
  loading={`eager`}
  contentFit={`cover`}
  accessibilityLabel={`Profile Photo`}
  style={{ width: `100%`, height: `100%` }}
  priority={photo === `maya` ? `high` : `low`}
  source={previewPhotos[photo] ?? previewPhotos.maya}
/>;
