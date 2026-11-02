import type { Dict } from './ru'

/** EN — professional translation from RU. British spelling (colour, centre): the pages are marked en_GB, see scripts/seo.mjs. */
export const en: Dict = {
  meta: {
    title: 'Kateryna Soroka — SMM, Content Creator, Reels Editing',
    description:
      'Creating the visual character of brands. SMM and Instagram management, content shoots, video editing and Reels, branding — from strategy to finished content.',
    ogAlt: 'Kateryna Soroka — portfolio',
  },
  common: {
    skipLink: 'Skip to content',
    placeholder: 'Materials coming soon',
    langSwitcher: 'Site language',
  },
  header: {
    portfolio: 'Portfolio',
    toTop: 'Back to top',
  },
  hero: {
    firstName: 'Kateryna',
    lastName: 'Soroka',
    roles: 'SMM / Content Creator / Video Editing',
    caption1: 'Creating the visual character of brands',
    caption2: 'From strategy → to finished content',
    portraitAlt: 'Kateryna Soroka in a black blazer',
  },
  about: {
    title: 'About me',
    paragraphs: [
      'I create content and promote businesses through social media.', // Katya 01.11: drop the years everywhere
      'I combine applied psychology and marketing to understand clients’ needs more deeply and to build communication based on trust, emotional resonance and mutual understanding with the audience.',
      'I develop SMM strategies, create visuals and creative edits, and build automated funnels into content.',
    ],
    photoAlt: 'Kateryna Soroka, portrait with her hair pulled back',
  },
  nav: {
    title: 'Navigation',
    items: {
      smm: 'SMM / Strategy',
      shooting: 'Content Shoots',
      editing: 'Video Editing',
      branding: 'Branding / Identity',
      portfolio: 'Portfolio',
      contacts: 'Contacts',
    },
  },
  smm: {
    title: 'SMM / Strategy',
    intro:
      'From consistent social media management to full-scale marketing support. Two formats of collaboration, depending on the goals and objectives of your business.',
    packages: {
      base: 'SMM Base',
      complete: 'SMM Complete',
    },
    rows: {
      audit: 'Instagram account audit',
      competitors: 'Competitor and target audience analysis',
      contentPlan: 'Content plan and content pillars',
      clientEditing: 'Editing of client photos/videos',
      copywriting: 'Copywriting',
      dailyDesign: 'Everyday visual design of Stories, Reels covers, posts, typography/graphics',
      storiesReels: 'Creating and publishing Stories/Reels',
      trends: 'Trend adaptation',
      expertContent: 'Expert and organic content',
      regularPosts: 'Regular posting',
      basicAnalytics: 'Basic reach and engagement analytics',
      strategy: 'Comprehensive marketing strategy',
      salesContent: 'Content for sales and launches',
      deepAnalytics: 'In-depth analytics with a focus on conversion',
      shooting: 'Shoots with a custom scope',
      crossposting: 'Adapting/republishing existing Instagram content for TikTok and YouTube Shorts',
      telegram: 'Telegram channel management and growth (content strategy, creation, publishing, engagement)',
      branding: 'Full logo / branding / identity design',
      landings: 'Landing pages',
      chatbots: 'Chatbots',
      funnels: 'Automated sales funnels and other automations',
    },
    legend: {
      yes: 'Included',
      no: 'Not included',
      extra: 'Add-on service, billed separately',
    },
    footnote:
      'The number of platforms, the list of services and the scope of work are defined individually, depending on the goals and objectives of the project.',
    cta: 'Discuss a project',
  },
  shooting: {
    title: 'Content Shoots',
    intro:
      'I create photo and video content that conveys the atmosphere, character and individuality of a brand. From the idea and visual concept to finished materials for social media.',
    stagesTitle: 'Stages',
    stages: [
      'Idea and references',
      'Preparation',
      'Mobile shooting on iPhone / DJI Osmo Pocket',
      'Selection and post-processing',
      'Reels editing',
    ],
    geoTitle: 'Shoot locations',
    geo: 'Chișinău · Moldova · Odesa',
    geoNote: 'Travel within Moldova and shoots in Odesa — by prior arrangement.',
    cta: 'Discuss a shoot',
  },
  editing: {
    title: 'Video Editing',
    intro:
      'I turn raw footage into dynamic videos that hold attention, convey mood and help brands stand out on social media.',
    servicesTitle: 'Services',
    services: [
      {
        name: 'Basic editing',
        includes: 'Cutting footage, story-driven structure, subtitles, background music, sound effects, basic colour correction',
      },
      {
        name: 'Reportage editing (events, backstage)',
        includes: 'Selecting the best shots, cutting to music, building the pace of the video, colour correction, sound design',
      },
      {
        name: 'Dynamic editing with animation',
        includes:
          'Hand-crafted rhythm, animated titles, chroma key, stock footage, effects, text and graphic elements, detailed sound design',
      },
    ],
    packagesTitle: 'Package discounts',
    packagesNote: 'Discount applies to the total for all videos',
    packages: [
      { name: '4-video package', discount: '10%' },
      { name: '8-video package', discount: '15%' },
      { name: '12-video package', discount: '20%' },
    ],
    aiTitle: 'AI Video',
    aiText: 'Creative videos made with artificial intelligence for brands, advertising campaigns and social media.',
    cta: 'Order video editing',
  },
  branding: {
    title: 'Branding / Visual Identity',
    text: 'Designing the logo, brand style and visual concept of a brand. Selecting the colour palette, typography and graphic elements to create a cohesive, recognisable visual image.',
    directionsTitle: 'Areas of work',
    directions: [
      'Logo design',
      'Brand style',
      'Colour palette and typography',
      'Graphic elements',
      'Brand visual concept',
    ],
    cta: 'Discuss a project',
  },
  portfolio: {
    title: 'Portfolio',
    count: { one: '{n} work', few: '{n} works', many: '{n} works', other: '{n} works' },
  },
  contacts: {
    title: 'Contacts',
    text: 'To collaborate or discuss a project, contact me in whatever way is convenient for you.',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    linkPending: 'Link coming soon',
    opensInNewTab: 'opens in a new tab',
  },
  lightbox: {
    label: 'Gallery viewer',
    close: 'Close',
    prev: 'Previous',
    next: 'Next',
    counter: '{i} of {n}',
    back: 'Back to case',
    open: 'Open',
  },
}
