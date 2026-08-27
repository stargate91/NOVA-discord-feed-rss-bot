import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  LayoutDashboard,
  Video,
  Radio,
  Gamepad2,
  GitBranch,
  HelpCircle,
  Clock,
  Cpu,
  Plus,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import {
  Badge,
  Button,
  Card,
  Chip,
  DiscordEmbed,
  SegmentedControl,
  ProgressBar,
  Accordion,
  Stack,
  Inline,
  Grid,
  Text,
  Container,
} from '../../ui';

type PreviewPlatform = 'youtube' | 'twitch' | 'steam' | 'github';

const BRAND_CHIPS = [
  { labelKey: 'home.brandYoutube', icon: '/images/brands/youtube.png' },
  { labelKey: 'home.brandTwitch', icon: '/images/brands/twitch.png' },
  { labelKey: 'home.brandKick', icon: '/images/brands/kick.png' },
  { labelKey: 'home.brandEpic', icon: '/images/brands/epic_games.png' },
  { labelKey: 'home.brandSteam', icon: '/images/brands/steam.png' },
  { labelKey: 'home.brandGog', icon: '/images/brands/gog.png' },
  { labelKey: 'home.brandTmdb', icon: '/images/brands/tmdb.png' },
  { labelKey: 'home.brandGithub', icon: '/images/brands/github.png' },
  { labelKey: 'home.brandRss', icon: '/images/brands/rss.png' },
] as const;

const PREVIEW_PLATFORMS = [
  { value: 'youtube', labelKey: 'home.platformYoutube', icon: Video },
  { value: 'twitch', labelKey: 'home.platformTwitch', icon: Radio },
  { value: 'steam', labelKey: 'home.platformSteam', icon: Gamepad2 },
  { value: 'github', labelKey: 'home.platformGithub', icon: GitBranch },
] as const;

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('youtube');

  const currentPlatform = selectedPlatform as PreviewPlatform;

  const embedData = {
    youtube: {
      author: {
        name: 'MrBeast (YouTube)',
        icon_url: '/images/brands/youtube.png',
        url: 'https://youtube.com',
      },
      title: '$1,000,000 Every 10 Seconds You Survive Inside a Circle!',
      titleUrl: 'https://youtube.com',
      description: 'The final 10 contestants face extreme obstacle challenges in the ultimate live event.',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      fields: [
        { name: 'Channel', value: '@MrBeast', inline: true },
        { name: 'Video Duration', value: '18:42', inline: true },
        { name: 'Upload Time', value: '2 mins ago', inline: true },
      ],
      footer: {
        text: 'YouTube Upload Notification • Nova Feeds',
        timestamp: 'Today at 18:00',
      },
    },
    twitch: {
      author: {
        name: 'Shroud (Twitch)',
        icon_url: '/images/brands/twitch.png',
        url: 'https://twitch.tv',
      },
      title: t('home.embedTitle'),
      titleUrl: 'https://twitch.tv',
      description: t('home.embedDescription'),
      thumbnail: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=60',
      image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
      fields: [
        { name: 'Category', value: 'VALORANT', inline: true },
        { name: 'Viewer Count', value: '24,510 Viewers', inline: true },
        { name: 'Uptime', value: 'Live for 14 mins', inline: true },
      ],
      footer: {
        text: t('home.embedFooter'),
        timestamp: t('home.embedTimestamp'),
      },
    },
    steam: {
      author: {
        name: 'Steam Deals Tracker',
        icon_url: '/images/brands/steam.png',
        url: 'https://store.steampowered.com',
      },
      title: 'FREE: Warhammer: Vermintide 2 is 100% OFF!',
      titleUrl: 'https://store.steampowered.com',
      description: 'Grab Warhammer: Vermintide 2 for free on Steam during this limited-time 100% discount promotional giveaway!',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=60',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
      fields: [
        { name: 'Original Price', value: '~~$29.99~~', inline: true },
        { name: 'Discount Price', value: '**FREE ($0.00)**', inline: true },
        { name: 'Offer Expiry', value: 'Sunday at 18:00 UTC', inline: true },
      ],
      footer: {
        text: 'Steam Price Drops • Nova Feeds',
        timestamp: 'Today at 17:15',
      },
    },
    github: {
      author: {
        name: 'FastAPI (GitHub)',
        icon_url: '/images/brands/github.png',
        url: 'https://github.com',
      },
      title: 'Release 0.115.0 · tiangolo/fastapi',
      titleUrl: 'https://github.com',
      description: 'New features: Support for Pydantic v2 recursive validation, performance improvements for async dependency injection.',
      thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=200&auto=format&fit=crop&q=60',
      image: undefined,
      fields: [
        { name: 'Tag', value: 'v0.115.0', inline: true },
        { name: 'Commit Hash', value: '`7b3d2ef`', inline: true },
        { name: 'Assets', value: '4 binaries attached', inline: true },
      ],
      footer: {
        text: 'GitHub Releases • Nova Feeds',
        timestamp: 'Today at 12:45',
      },
    },
  };

  return (
    <Stack gap="5xl">
      <SEO
        title={t('home.heroTitleHighlight')}
        description={t('home.heroDescription')}
      />

      {/* Hero Section */}
      <Stack align="center" gap="2xl">
        <Stack align="center" gap="md">
          <Badge variant="online" size="md" dot pulse>
            <Sparkles size={14} /> {t('home.heroTag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('home.heroTitle')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('home.heroTitleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="md" centered>
            <Text size="lg" color="secondary" align="center">
              {t('home.heroDescription')}
            </Text>
          </Container>
        </Stack>

        <Inline gap="md" justify="center" wrap>
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              window.open(
                'https://discord.com/oauth2/authorize?client_id=1489908793780338688&permissions=277025508352&scope=bot%20applications.commands',
                '_blank'
              )
            }
          >
            <Plus size={18} /> {t('home.ctaDiscord')}
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate('/servers')}>
            <LayoutDashboard size={18} /> {t('home.ctaDashboard')}
          </Button>
        </Inline>

        {/* Brand Supported Carousel */}
        <Container maxWidth="md" centered>
          <Inline justify="center" gap="sm" wrap>
            {BRAND_CHIPS.map((chip) => (
              <Chip key={chip.labelKey} label={t(chip.labelKey)} icon={chip.icon} />
            ))}
          </Inline>
        </Container>
      </Stack>

      {/* Interactive Live Preview Demonstration */}
      <Stack align="center" gap="xl">
        <Stack align="center" gap="2xs">
          <Text as="h2" size="2xl" weight="bold" align="center">{t('home.previewTitle')}</Text>
          <Text size="sm" color="secondary" align="center">
            {t('home.previewSubtitle')}
          </Text>
        </Stack>

        <SegmentedControl
          size="md"
          value={selectedPlatform}
          onChange={setSelectedPlatform}
          options={PREVIEW_PLATFORMS.map((p) => {
            const IconComponent = p.icon;
            return {
              value: p.value,
              label: t(p.labelKey),
              icon: <IconComponent size={15} />,
            };
          })}
        />

        <DiscordEmbed
          channelName="feed-alerts"
          botName={t('home.embedBotName')}
          avatarUrl="/images/logo.webp"
          timestamp={embedData[currentPlatform].footer.timestamp}
          author={embedData[currentPlatform].author}
          title={embedData[currentPlatform].title}
          titleUrl={embedData[currentPlatform].titleUrl}
          description={embedData[currentPlatform].description}
          thumbnail={embedData[currentPlatform].thumbnail}
          image={embedData[currentPlatform].image}
          fields={embedData[currentPlatform].fields}
          footer={embedData[currentPlatform].footer}
        />
      </Stack>

      {/* Features Grid */}
      <Stack gap="xl">
        <Stack align="center" gap="2xs">
          <Text as="h2" size="2xl" weight="bold" align="center">{t('home.scaleSpeedTitle')}</Text>
          <Container maxWidth="sm" centered>
            <Text size="sm" color="secondary" align="center">
              {t('home.scaleSpeedDesc')}
            </Text>
          </Container>
        </Stack>

        <Grid minItemWidth="md" gap="xl">
          <Card glow="blue" interactive>
            <Card.Header>
              <Card.Title>{t('home.featureRealtimeTitle')}</Card.Title>
              <Card.Actions>
                <Zap size={18} color="var(--blue-400)" />
              </Card.Actions>
            </Card.Header>
            <Card.Description>{t('home.featureRealtimeSubtitle')}</Card.Description>
            <Card.Body>
              <Text size="sm" color="secondary">{t('home.featureRealtimeDesc')}</Text>
            </Card.Body>
          </Card>

          <Card glow="green" interactive>
            <Card.Header>
              <Card.Title>{t('home.featureReliabilityTitle')}</Card.Title>
              <Card.Actions>
                <ShieldCheck size={18} color="var(--status-success)" />
              </Card.Actions>
            </Card.Header>
            <Card.Description>{t('home.featureReliabilitySubtitle')}</Card.Description>
            <Card.Body>
              <Text size="sm" color="secondary">{t('home.featureReliabilityDesc')}</Text>
            </Card.Body>
          </Card>

          <Card glow="purple" interactive>
            <Card.Header>
              <Card.Title>{t('home.featureLayoutsTitle')}</Card.Title>
              <Card.Actions>
                <SlidersHorizontal size={18} color="var(--status-purple)" />
              </Card.Actions>
            </Card.Header>
            <Card.Description>{t('home.featureLayoutsSubtitle')}</Card.Description>
            <Card.Body>
              <Text size="sm" color="secondary">{t('home.featureLayoutsDesc')}</Text>
            </Card.Body>
          </Card>
        </Grid>
      </Stack>

      {/* Live Performance & SLA Stats */}
      <Grid minItemWidth="sm" gap="lg">
        <Card>
          <Card.Header>
            <Card.Title>{t('home.statLatencyTitle')}</Card.Title>
            <Card.Actions>
              <Clock size={16} color="var(--blue-400)" />
            </Card.Actions>
          </Card.Header>
          <Stack gap="sm">
            <Text size="3xl" weight="black">{t('home.statLatencyValue')}</Text>
            <ProgressBar
              value={92}
              size="sm"
              variant="brand"
              label={t('home.statLatencyLabel')}
              showValue
              valueFormat={() => t('home.statLatencyProgress')}
            />
          </Stack>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>{t('home.statPollingTitle')}</Card.Title>
            <Card.Actions>
              <Cpu size={16} color="var(--status-success)" />
            </Card.Actions>
          </Card.Header>
          <Stack gap="sm">
            <Text size="3xl" weight="black">{t('home.statPollingValue')}</Text>
            <ProgressBar
              value={99.98}
              size="sm"
              variant="success"
              label={t('home.statPollingLabel')}
              showValue
              valueFormat={() => t('home.statPollingProgress')}
            />
          </Stack>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>{t('home.statQuotaTitle')}</Card.Title>
            <Card.Actions>
              <Zap size={16} color="var(--status-warning)" />
            </Card.Actions>
          </Card.Header>
          <Stack gap="sm">
            <Text size="3xl" weight="black">{t('home.statQuotaValue')}</Text>
            <ProgressBar
              value={42}
              size="sm"
              variant="brand"
              label={t('home.statQuotaLabel')}
              showValue
              valueFormat={() => t('home.statQuotaProgress')}
            />
          </Stack>
        </Card>
      </Grid>

      {/* Frequently Asked Questions Section */}
      <Container maxWidth="sm" centered>
        <Stack gap="xl">
          <Stack align="center" gap="2xs">
            <Text as="h2" size="2xl" weight="bold" align="center">{t('home.faqTitle')}</Text>
            <Text size="sm" color="secondary" align="center">
              {t('home.faqSubtitle')}
            </Text>
          </Stack>

          <Accordion type="single" variant="card" defaultValue="faq-1">
            <Accordion.Item value="faq-1">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('home.faq1Question')}
              </Accordion.Trigger>
              <Accordion.Content>
                {t('home.faq1Answer')}
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-2">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('home.faq2Question')}
              </Accordion.Trigger>
              <Accordion.Content>
                {t('home.faq2Answer')}
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-3">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('home.faq3Question')}
              </Accordion.Trigger>
              <Accordion.Content>
                {t('home.faq3Answer')}
              </Accordion.Content>
            </Accordion.Item>

            <Accordion.Item value="faq-4">
              <Accordion.Trigger icon={<HelpCircle size={18} />}>
                {t('home.faq4Question')}
              </Accordion.Trigger>
              <Accordion.Content>
                {t('home.faq4Answer')}
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
        </Stack>
      </Container>

      {/* Bottom Call to Action Card */}
      <Card glow="blue" padding="xl">
        <Inline justify="between" align="center" wrap gap="2xl">
          <Stack gap="3xs">
            <Text as="h3" size="xl" weight="bold">{t('home.ctaSuperpowerTitle')}</Text>
            <Text size="sm" color="secondary">
              {t('home.ctaSuperpowerDesc')}
            </Text>
          </Stack>

          <Inline gap="md" wrap>
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                window.open(
                  'https://discord.com/oauth2/authorize?client_id=1489908793780338688&permissions=277025508352&scope=bot%20applications.commands',
                  '_blank'
                )
              }
            >
              <Plus size={18} /> {t('home.ctaDiscord')}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/servers')}>
              <LayoutDashboard size={18} /> {t('home.ctaDashboard')}
            </Button>
          </Inline>
        </Inline>
      </Card>
    </Stack>
  );
};
