export const servers = {
  title: 'Select a Discord Server',
  subtitle:
    'Choose a server to configure notification feeds, customize embeds, and monitor statistics.',
  addBot: 'Add Nova to New Server',
  statusLabel: 'Status',
  statusActive: 'Active',
  statusNotInvited: 'Not Invited',
  planLabel: 'Plan',
  activeFeedsLabel: 'Active Feeds',
  monitorsCount: '{count} Monitors',
  manageBtn: 'Manage Server',
  inviteBtn: 'Invite Bot',
  noServersFound: 'No Manageable Discord Servers Found',
  noServersDesc:
    'You must have Administrator or Manage Server permissions on a Discord guild to configure NovaFeeds.',
  errorLoadingServers: 'Unable to load Discord servers',
  errorLoadingServersDesc:
    'Could not retrieve your manageable servers. Please check your connection or sign in again.',
  retryBtn: 'Retry Loading Servers',
  signInToView: 'Sign In with Discord to View Servers',
} as const;
