import { Composition, Still } from 'remotion';
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from '../config/timing';
import { Showreel, showreelSchema } from './Showreel';
import { Thumbnail, thumbnailSchema } from './Thumbnail';
import { BusinessProjects } from '../gallery/BusinessProjects';
import { CreativeDesign } from '../gallery/CreativeDesign';
import { CustomWebsites } from '../gallery/CustomWebsites';
import { galleryLocaleSchema } from '../gallery/schema';

// One registration per deliverable; any platform/locale pair can also be rendered
// from "Showreel" with props (see scripts/render.mjs and README.md).
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Showreel"
        component={Showreel}
        schema={showreelSchema}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ platform: 'neutral' as const, locale: 'en' as const, mute: false }}
      />
      <Composition
        id="Showreel-Fiverr"
        component={Showreel}
        schema={showreelSchema}
        durationInFrames={DURATION_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ platform: 'fiverr' as const, locale: 'en' as const, mute: false }}
      />
      <Still id="Thumbnail" component={Thumbnail} schema={thumbnailSchema} width={1920} height={1080} defaultProps={{ locale: 'en' as const }} />
      <Still id="Thumbnail-720" component={Thumbnail} schema={thumbnailSchema} width={1280} height={720} defaultProps={{ locale: 'en' as const }} />
      {/* Fiverr gallery images (gallery/, rendered by `npm run gallery`). */}
      <Still id="Gallery-CustomWebsites" component={CustomWebsites} schema={galleryLocaleSchema} width={1280} height={769} defaultProps={{ locale: 'en' as const }} />
      <Still id="Gallery-BusinessProjects" component={BusinessProjects} schema={galleryLocaleSchema} width={1280} height={769} defaultProps={{ locale: 'en' as const }} />
      <Still id="Gallery-CreativeDesign" component={CreativeDesign} schema={galleryLocaleSchema} width={1280} height={769} defaultProps={{ locale: 'en' as const }} />
    </>
  );
};
