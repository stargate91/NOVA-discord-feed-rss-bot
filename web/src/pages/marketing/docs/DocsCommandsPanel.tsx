import React from 'react';
import { useTranslation } from '@/i18n';
import { Card, Table } from '@/ui';

export const DocsCommandsPanel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Card glow="purple" padding="xl">
      <Card.Header>
        <Card.Title>{t('docs.section3Title')}</Card.Title>
      </Card.Header>
      <Card.Description>{t('docs.section3Desc')}</Card.Description>
      <Card.Body>
        <Table variant="glass" density="normal">
          <Table.Header>
            <Table.Row>
              <Table.Head>{t('docs.tableHeadCommand')}</Table.Head>
              <Table.Head>{t('docs.tableHeadDescription')}</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>
                <code>{t('docs.cmdAdd')}</code>
              </Table.Cell>
              <Table.Cell>{t('docs.cmdAddDesc')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <code>{t('docs.cmdList')}</code>
              </Table.Cell>
              <Table.Cell>{t('docs.cmdListDesc')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <code>{t('docs.cmdTest')}</code>
              </Table.Cell>
              <Table.Cell>{t('docs.cmdTestDesc')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <code>{t('docs.cmdRemove')}</code>
              </Table.Cell>
              <Table.Cell>{t('docs.cmdRemoveDesc')}</Table.Cell>
            </Table.Row>
            <Table.Row>
              <Table.Cell>
                <code>{t('docs.cmdStatus')}</code>
              </Table.Cell>
              <Table.Cell>{t('docs.cmdStatusDesc')}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </Card.Body>
    </Card>
  );
};
