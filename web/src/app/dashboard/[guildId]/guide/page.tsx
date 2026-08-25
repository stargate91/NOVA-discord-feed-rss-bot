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
import styles from './guide.module.css';

function GuideContent() {
  const params = useParams();
  const guildId = (params?.guildId as string) || '';

  return (
    <div className={styles['guide-container']}>
      {/* ── Page Header ── */}
      <PageHeader
        title="Quick Start Guide"
        description="Follow these 4 simple steps to set up automated high-fidelity feeds for your server."
        badge={
          <Badge variant="primary" size="sm" icon={<Sparkles size={12} />}>
            ONBOARDING
          </Badge>
        }
      />

      {/* ── Steps List ── */}
      <div className={styles['steps-list']}>
        {GUIDE_STEPS.map((step) => (
          <div key={step.id} className={styles['step-card']}>
            <div className={styles['step-header']}>
              <div className={styles['step-icon-box']}>
                {renderGuideStepIcon(step.iconName, 22)}
              </div>
              <div className={styles['step-title-wrap']}>
                <span className={styles['step-num']}>Step 0{step.id}</span>
                <h3 className={styles['step-title']}>{step.title}</h3>
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
              <Link href={`/dashboard/${guildId}/${step.pathSuffix}`}>
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
