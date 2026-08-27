export const support = {
  tag: 'Support & Help Center',
  title: 'Need Help with',
  titleHighlight: 'Nova?',
  subtitle: 'Find answers to common setup questions, troubleshoot feed delivery issues, or join our community Discord server for live assistance.',

  discordTitle: 'Join the Official Support Discord',
  discordSubtitle: 'Get real-time assistance from the development team and community',
  discordDesc: 'Have a question, encountered a bug, or want to suggest a new platform monitor? Join our verified Discord community to get instant support and early access to upcoming releases.',
  discordCta: 'Join Nova Support Server',

  faqTitle: 'Common Questions & Solutions',
  faqStreamQ: 'Why is my stream or YouTube feed not posting?',
  faqStreamA: 'Ensure that Nova has the View Channel, Send Messages, and Embed Links permissions in the target text channel. You can run /feed test in Discord to verify channel delivery permissions.',
  faqLanguageQ: 'How do I change the language of the bot messages?',
  faqLanguageA: 'Server administrators can change the guild language in the Nova Web Dashboard under Guild Settings or via Discord with /settings language [locale]. Over 17 languages are natively supported!',
  faqRoleQ: 'Can I mention @everyone or custom roles on new posts?',
  faqRoleA: 'Yes! When adding or editing a feed, you can specify a ping_role parameter. The bot will cleanly mention that role above the rich embed card.',
} as const;
