"use client";

import React, { Suspense } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Crown, 
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout';
import {
  Badge,
  Button,
  Spinner,
  Text,
} from '@/components/ui';
import { GUIDE_STEPS, renderGuideStepIcon } from '@/constants/guide';
import { getGuildDashboardRoute } from '@/utils/navigation';
import styles from './guide.module.css';

function GuideContent() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '';

  return (
    <div className={styles['guide-container']}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Quick Start Guide"
        description="Master the features and set up powerful automated monitoring pipelines."
        badge={
          <Badge variant="warning" size="sm" icon={<Sparkles size={12} />}>
            Interactive Checklist
          </Badge>
        }
      />

      {/* ── Guide Steps List ── */}
      <div className={styles['steps-list']}>
        {GUIDE_STEPS.map((step) => (
          <div key={step.id} className={styles['step-card']}>
            <div className={styles['step-header']}>
              <div className={styles['step-icon-wrap']}>
                {renderGuideStepIcon(step.iconName)}
              </div>
              <div className={styles['step-titles']}>
                <span className={styles['step-num']}>{String(step.id).padStart(2, '0')}</span>
                <Text as="h3" size="lg" weight="semibold">
                  {step.title}
                </Text>
              </div>
            </div>

            <Text as="p" size="sm" variant="secondary" className={styles['step-desc']}>
              {step.description}
            </Text>

            <div className={styles['tips-list']}>
              {step.tips.map((tip, idx) => (
                <div key={idx} className={styles['tip-item']}>
                  <CheckCircle2 size={14} className={styles['tip-icon']} />
                  <span>{tip.text}</span>
                  {tip.premium && (
                    <Badge variant="warning" size="sm" icon={<Crown size={10} />}>
                      Premium
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className={styles['step-actions']}>
              <Link href={getGuildDashboardRoute(guildId, step.pathSuffix)}>
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
                  {step.linkText}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={<Spinner size="lg" label="Loading guide..." />}>
      <GuideContent />
    </Suspense>
  );
}
