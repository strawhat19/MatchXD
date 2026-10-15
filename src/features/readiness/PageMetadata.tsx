import Head from 'expo-router/head';
import { usePathname } from 'expo-router';
import { publicPages, type PublicPageKey } from '../../shared/readiness/status';

export const PageMetadata = () => {
  const path = usePathname();
  const page = publicPages[path.slice(1) as PublicPageKey];
  const isPublic = path === `/` || Boolean(page);
  const title = page?.title ?? (path === `/` ? `MatchXD · Adult Dating App Preview` : `MatchXD · Device Preview`);
  const description = page?.description ?? `Explore MatchXD's fictional adult profiles and device-only dating app preview. No real accounts or messaging are connected.`;
  return <Head><title>{title}</title><meta name={`description`} content={description} /><meta name={`robots`} content={isPublic ? `index,follow` : `noindex,nofollow`} /><meta property={`og:title`} content={title} /><meta property={`og:description`} content={description} /></Head>;
};
