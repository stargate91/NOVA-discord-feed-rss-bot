export interface PrivacyListItem {
  prefix?: string;
  text: string;
}

export interface PrivacySection {
  id: number;
  title: string;
  description?: string;
  list?: PrivacyListItem[];
  content?: string;
  link?: {
    text: string;
    href: string;
  };
}

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    id: 1,
    title: "1. Information We Collect",
    description:
      "When you use NovaFeeds and our dashboard, we collect the minimum amount of data necessary to provide our services. This includes:",
    list: [
      {
        prefix: "Discord Profile Data: ",
        text: "Your Discord ID, username, and avatar URL when you log in.",
      },
      {
        prefix: "Server Data: ",
        text: "IDs and names of servers where the bot is invited, and channel IDs you configure for feeds.",
      },
      {
        prefix: "Feed Configurations: ",
        text: "URLs and settings for the feeds you choose to monitor.",
      },
    ],
  },
  {
    id: 2,
    title: "2. How We Use Your Data",
    description:
      "We use the collected information solely for the operation and improvement of NovaFeeds. This includes:",
    list: [
      {
        text: "Delivering automated messages to your configured Discord channels.",
      },
      {
        text: "Authenticating your access to the web dashboard.",
      },
      {
        text: "Managing your premium subscriptions via our payment provider (Stripe).",
      },
    ],
  },
  {
    id: 3,
    title: "3. Data Sharing and Third Parties",
    content:
      "We do not sell, trade, or otherwise transfer your personal information to outside parties. Your data may be shared with trusted third parties who assist us in operating our services (e.g., Stripe for payments), provided they agree to keep this information confidential.",
  },
  {
    id: 4,
    title: "4. Data Retention and Deletion",
    content:
      "Your data is stored securely in our database. If you remove NovaFeeds from your server, your server's feed configurations will become inactive. You may request the complete deletion of your data by contacting us on our Support Server.",
  },
  {
    id: 5,
    title: "5. Cookies",
    content:
      "Our web dashboard uses session cookies (via NextAuth) strictly for authentication purposes to keep you logged in. We do not use tracking or advertising cookies.",
  },
  {
    id: 6,
    title: "6. Contact Us",
    content:
      "If you have any questions regarding this Privacy Policy, please contact us on our ",
    link: {
      text: "Support Server",
      href: "https://discord.gg/PbvX3S7pXR",
    },
  },
];
