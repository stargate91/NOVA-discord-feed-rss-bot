export interface LegalSection {
  id: number;
  title: string;
  content: string;
  link?: {
    text: string;
    href: string;
  };
}

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: 1,
    title: "1. Acceptance of Terms",
    content:
      "By inviting NovaFeeds to your Discord server or logging into our web dashboard, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the bot.",
  },
  {
    id: 2,
    title: "2. Description of Service",
    content:
      "NovaFeeds is a Discord bot that provides automated feed notifications (including Free Games, YouTube, Twitch, RSS, and Crypto updates) to Discord servers. We provide a web dashboard to configure these feeds.",
  },
  {
    id: 3,
    title: "3. User Responsibilities",
    content:
      "You are responsible for the feeds you configure NovaFeeds to monitor. You agree not to use NovaFeeds to distribute illegal, offensive, or malicious content. We reserve the right to remove the bot from your server or ban your account if you violate Discord's Terms of Service or our guidelines.",
  },
  {
    id: 4,
    title: "4. Premium Subscriptions",
    content:
      "NovaFeeds offers premium features through a subscription model. Payments are securely processed via Stripe. Subscriptions automatically renew unless canceled. You may cancel your subscription at any time through the dashboard. Refunds are subject to our refund policy and handled on a case-by-case basis.",
  },
  {
    id: 5,
    title: "5. Limitation of Liability",
    content:
      'NovaFeeds is provided "as is" without any warranties. We do not guarantee 100% uptime or the complete accuracy of feed deliveries. In no event shall NovaFeeds or its developers be liable for any damages arising out of the use or inability to use the service.',
  },
  {
    id: 6,
    title: "6. Changes to Terms",
    content:
      "We reserve the right to modify these Terms of Service at any time. Continued use of NovaFeeds after any such changes constitutes your consent to such changes.",
  },
  {
    id: 7,
    title: "7. Contact Us",
    content: "If you have any questions about these Terms, please reach out to us on our ",
    link: {
      text: "Support Server",
      href: "https://discord.gg/PbvX3S7pXR",
    },
  },
];
