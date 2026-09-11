export const avatarOptions = [
  { id: `avatar:coral`, label: `Coral`, face: `#FFC2AA`, accent: `#B63055`, background: `#FFE1E9` },
  { id: `avatar:violet`, label: `Violet`, face: `#D4BBFF`, accent: `#6A42A1`, background: `#EEE5FF` },
  { id: `avatar:ocean`, label: `Ocean`, face: `#9CD9E9`, accent: `#246689`, background: `#DCF3F9` },
  { id: `avatar:mint`, label: `Mint`, face: `#A8DDC0`, accent: `#317558`, background: `#E0F3E8` },
  { id: `avatar:sunshine`, label: `Sunshine`, face: `#FFD37C`, accent: `#93632B`, background: `#FFF1CC` },
  { id: `avatar:rose`, label: `Rose`, face: `#EDB2D4`, accent: `#9C3E79`, background: `#FBE0F0` },
] as const;

export const defaultProfileAvatar = avatarOptions[0].id;
export const maxProfilePhotoBytes = 2 * 1024 * 1024;
export const isProfileAvatar = (photo: string) => avatarOptions.some(avatar => avatar.id === photo);
export const isStoredProfilePhoto = (photo: string) => {
  if (photo.length > Math.ceil(maxProfilePhotoBytes / 3) * 4 + 32) return false;
  const match = /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(photo);
  const data = match?.[1];
  if (!data || data.length % 4) return false;
  const padding = data.endsWith(`==`) ? 2 : data.endsWith(`=`) ? 1 : 0;
  return data.length * 3 / 4 - padding <= maxProfilePhotoBytes;
};
