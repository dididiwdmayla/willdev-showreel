// Open-licence fonts from @fontsource (see config/branding.ts). Rendering waits until they are ready.
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/chakra-petch/500.css';
import '@fontsource/chakra-petch/600.css';
import { continueRender, delayRender } from 'remotion';

const faces = ['500 40px "Space Grotesk"', '700 40px "Space Grotesk"', '500 20px "Chakra Petch"', '600 20px "Chakra Petch"'];

if (typeof document !== 'undefined') {
  const handle = delayRender('Loading fonts');
  Promise.all(faces.map((f) => document.fonts.load(f)))
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
}
