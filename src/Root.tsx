import { Composition, Still } from 'remotion';
import { DURATION_FRAMES, FPS, HEIGHT, WIDTH } from '../config/timing';
import { Showreel, showreelSchema } from './Showreel';
import { Thumbnail, thumbnailSchema } from './Thumbnail';
import { BusinessProjects } from '../gallery/BusinessProjects';
import { CreativeDesign } from '../gallery/CreativeDesign';
import { CustomWebsites } from '../gallery/CustomWebsites';
import { galleryLocaleSchema } from '../gallery/schema';
import { Cover, coverSchema } from '../portfolio/Cover';

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
      {/* Fiverr portfolio covers (portfolio/, rendered by `npm run portfolio`). */}
      <Still id="Portfolio-HardEletric" component={Cover} schema={coverSchema} width={1280} height={769} defaultProps={{ file: 'portfolio-hard-eletric' }} />
      <Still id="Portfolio-VG" component={Cover} schema={coverSchema} width={1280} height={769} defaultProps={{ file: 'portfolio-vg-construcoes' }} />
      <Still id="Portfolio-Lancheria" component={Cover} schema={coverSchema} width={1280} height={769} defaultProps={{ file: 'portfolio-lancheria-meia-noite' }} />
      <Still id="Portfolio-InterativMind" component={Cover} schema={coverSchema} width={1280} height={769} defaultProps={{ file: 'portfolio-interativmind' }} />
      <Still id="Portfolio-Advocacia" component={Cover} schema={coverSchema} width={1280} height={769} defaultProps={{ file: 'portfolio-advocacia-demo' }} />
    </>
  );
};
