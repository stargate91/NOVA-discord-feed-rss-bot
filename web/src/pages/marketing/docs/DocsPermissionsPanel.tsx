import React from 'react';
import { useTranslation } from '@/i18n';
import { Card, Table, Badge } from '@/ui';

export const DocsPermissionsPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card glow="blue" padding="xl">
      <Card.Header>
        <Card.Title>{t('docs.section1Title')}</Card.Title>
      </Card.Header>
      <Card.Description>{t('docs.section1Desc')}</Card.Description>
      <Card.Body>
        <Table variant="glass" density="normal">
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('docs.tableHeadPermission')}</Table.Head>
              <Table.Head>{t('docs.tableHeadPurpose')}</Table.Head>
              <Table.Head align="center">{t('docs.tableHeadStatus')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <strong>{t('docs.permSend')}</strong>
              </Table.Cell>
              <Table.Cell>{t('docs.permSendDesc')}</Table.Cell>
              <Table.Cell align="center">
                <Badge variant="online" dot>
                  {t('docs.badgeRequired')}
                </Badge>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <strong>{t('docs.permAttach')}</strong>
              </Table.Cell>
              <Table.Cell>{t('docs.permAttachDesc')}</Table.Cell>
              <Table.Cell align="center">
                <Badge variant="online" dot>
                  {t('docs.badgeRequired')}
                </Badge>
              </Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <strong>{t('docs.permMention')}</strong>
              </Table.Cell>
              <Table.Cell>{t('docs.permMentionDesc')}</Table.Cell>
              <Table.Cell align="center">
                <Badge variant="tier">{t('docs.badgeOptional')}</Badge>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Card.Body>
    </Card>
  );
};
