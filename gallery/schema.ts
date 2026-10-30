import { z } from 'zod';
import { galleryCopy, type GalleryLocale } from './copy';

export const galleryLocaleSchema = z.object({
  locale: z.enum(Object.keys(galleryCopy) as [GalleryLocale, ...GalleryLocale[]]),
});
