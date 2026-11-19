// Deutsch (Hochdeutsch, für Deutschland, Österreich und die Schweiz). Gleiche Struktur wie locales/en.ts.
// Formelle Anrede ("Sie", "Ihre") überall, wo der Käufer direkt angesprochen wird.
import type { Messages } from './en';

export const de: Messages = {
  opening: {
    line1: 'Nicht nur eine Website.',
    line2: 'Ein Erlebnis.',
    line2Key: 'Erlebnis',
  },
  lancheria: {
    // "zum Anfassen" = hands-on, tangible: the natural German phrase for interactive.
    headline: ['Gemacht', 'zum', 'Anfassen.'],
    label: 'Lancheria Meia-Noite',
    kind: 'Speisekarte · Konzept',
  },
  hardeletric: {
    headline: 'Präzise umgesetzt.',
    label: 'Hard Eletric',
    kind: 'Elektroinstallation · Kundenprojekt',
  },
  vg: {
    headline: 'Für echte Unternehmen entwickelt.',
    sub: 'Für Desktop und Smartphone, von Anfang an.',
    label: 'VG Construção',
    kind: 'Bauunternehmen · Kundenprojekt',
  },
  interativmind: {
    headline: 'Gestaltet mit Fantasie.',
    label: 'interativMind',
    kind: 'Lernplattform · Konzept',
  },
  closing: {
    line1: 'Ihre Vision.',
    line2: 'Wird Realität.',
    line2Key: 'Realität',
    services: ['Individuelle Websites', 'Landingpages', 'Interaktive Erlebnisse'],
    ctaNeutral: 'Starten wir Ihr Projekt.',
    ctaPlatform: 'Schreiben Sie mir hier auf {platform}',
  },
  restaurant: {
    hook: 'Speisekarten zum Anfassen.',
    hookKey: 'Anfassen',
    chapaLabel: 'Chapa Burger',
    chapaKind: 'Burger-Restaurant-Website · Konzept',
    variantsTitle: 'Vier Layouts. Eine Karte.',
    variants: {
      chapa: 'Nachbarschaftsgrill',
      balcao: 'Mittagstheke',
      sala: 'Autorenküche',
      praca: 'Foodtruck',
    },
    bridge: 'Und ein Shop, der verkauft.',
    bridgeKey: 'verkauft',
    ingarandiLabel: 'Ingarandi Burger',
    ingarandiKind: 'Online-Bestellung · Kundenprojekt',
    steps: ['Auswählen', 'In die Tasche', 'Warenkorb', 'Online bezahlen', 'Mercado Pago', 'Bezahlt'],
    testBadge: 'Mercado-Pago-Testumgebung',
    closing: 'Websites, die verkaufen.',
    closingKey: 'verkaufen',
    cta: 'Starten wir Ihr Projekt.',
  },
  thumbnail: {
    line1: 'Websites, die',
    line2: 'lebendig wirken.',
    line2Key: 'lebendig',
  },
};
