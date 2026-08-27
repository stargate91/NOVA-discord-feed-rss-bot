import React from 'react';
import { GitBranch, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { SEO } from '../../components/common/SEO';
import { Card, Badge, Container, Stack, Text } from '../../ui';

export const ChangelogPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Container maxWidth="md" padding="md">
      <SEO title={t('changelog.tag')} description={t('changelog.subtitle')} />

      <Stack gap="5xl">
        <Stack align="center" gap="md">
          <Badge variant="outline" size="md" dot pulse>
            <GitBranch size={14} /> {t('changelog.tag')}
          </Badge>
          <Text as="h1" size="hero" weight="extrabold" align="center">
            {t('changelog.title')}{' '}
            <Text as="span" color="gradient" size="hero" weight="extrabold">
              {t('changelog.titleHighlight')}
            </Text>
          </Text>
          <Container maxWidth="sm" centered>
            <Text size="lg" color="secondary" align="center">
              {t('changelog.subtitle')}
            </Text>
          </Container>
        </Stack>

        <Stack gap="xl">
          {/* Release v1.0.0 */}
          <Card
            glow="blue"
            interactive
            padding="xl"
            title={t('changelog.v100Title')}
            subtitle={t('changelog.v100Subtitle')}
            action={
              <Badge variant="online" dot pulse>
                <Sparkles size={12} /> {t('changelog.v100Badge')}
              </Badge>
            }
          >
            <Stack gap="md">
              <Text color="secondary">{t('changelog.v100Desc')}</Text>
              <Stack as="ul" gap="xs">
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature1')}
                </Text>
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature2')}
                </Text>
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature3')}
                </Text>
                <Text as="li" size="sm" weight="semibold">
                  • {t('changelog.v100Feature4')}
                </Text>
              </Stack>
            </Stack>
          </Card>

          {/* Release v0.9.0 */}
          <Card
            padding="xl"
            title={t('changelog.v090Title')}
            subtitle={t('changelog.v090Subtitle')}
            action={<Badge variant="neutral">{t('changelog.v090Badge')}</Badge>}
          >
            <Stack as="ul" gap="xs">
              <Text as="li" size="sm" weight="semibold">
                • {t('changelog.v090Feature1')}
              </Text>
              <Text as="li" size="sm" weight="semibold">
                • {t('changelog.v090Feature2')}
              </Text>
              <Text as="li" size="sm" weight="semibold">
                • {t('changelog.v090Feature3')}
              </Text>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Container>
  );
};
