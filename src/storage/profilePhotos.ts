import { Platform } from 'react-native';
import { Directory, Paths } from 'expo-file-system';

export const profilePhotosDirectory = () => new Directory(Paths.document, `matchxd-profile-photos`);
export const clearProfilePhotos = () => {
  if (Platform.OS === `web`) return;
  const directory = profilePhotosDirectory();
  if (directory.exists) directory.delete();
};
