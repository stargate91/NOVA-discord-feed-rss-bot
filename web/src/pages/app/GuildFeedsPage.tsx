import React from 'react';
import { useParams } from 'react-router-dom';
import { Stack, Grid } from '@/ui';
import { useToast } from '@/components/common/Toast';
import { useTranslation } from '@/i18n';
import {
  FeedPageHeader,
  FeedPlatformSelector,
  FeedCreateCard,
  FeedEmbedPreview,
  useFeedForm,
  useGuildFeeds,
} from '@/features/feeds';

export const GuildFeedsPage: React.FC = () => {
  const { guildId = '' } = useParams<{ guildId: string }>();
  const { t } = useTranslation();
  const toast = useToast();
  const { createFeed, isCreating } = useGuildFeeds(guildId);
  const feedForm = useFeedForm();

  const handleTestFeed = () => {
    toast.success(
      t('guild.toastTestDispatched', {
        type: feedForm.formState.platform.toUpperCase(),
        destChannel: feedForm.formState.destChannel,
      }),
      t('guild.toastTestDispatchedTitle')
    );
  };

  return (
    <Stack gap="xl">
      <FeedPageHeader
        guildId={guildId}
        onClearForm={feedForm.resetForm}
        onRunTest={handleTestFeed}
      />

      <FeedPlatformSelector
        selected={feedForm.formState.platform}
        onSelect={feedForm.setPlatform}
      />

      <Grid minItemWidth="md" gap="lg">
        <FeedCreateCard
          guildId={guildId}
          form={feedForm}
          isSubmitting={isCreating}
          onSubmitFeed={createFeed}
        />

        <FeedEmbedPreview guildId={guildId} formState={feedForm.formState} />
      </Grid>
    </Stack>
  );
};
