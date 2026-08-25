import { useState, useEffect } from 'react';
import devService, {
  AnnouncementItem,
  BotStatusItem,
  PremiumKeyItem,
} from '@/services/dev_service';
import { useToast } from '@/context/toast_context';

export function useDevControls() {
  const { addToast } = useToast();

  const [keys, setKeys] = useState<PremiumKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState('30');
  const [customDays, setCustomDays] = useState('30');
  const [maxUses, setMaxUses] = useState('1');
  const [generating, setGenerating] = useState(false);
  const [copying, setCopying] = useState<string | null>(null);
  const [tier, setTier] = useState('3');

  // Section Accordion Toggles
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const [showPremium, setShowPremium] = useState(true);
  const [showMaintenance, setShowMaintenance] = useState(false);

  // Status & Presence State
  const [statuses, setStatuses] = useState<BotStatusItem[]>([]);
  const [rotationMode, setRotationMode] = useState('random');
  const [rotationInterval, setRotationInterval] = useState('60');
  const [newStatusType, setNewStatusType] = useState('watching');
  const [newStatusText, setNewStatusText] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Broadcast State
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [newAnnounce, setNewAnnounce] = useState<{
    title: string;
    content: string;
    type: 'info' | 'warning' | 'alert' | 'maintenance';
  }>({ title: '', content: '', type: 'info' });
  const [announceLoading, setAnnounceLoading] = useState(false);

  // Maintenance Modal State
  const [modalConfig, setModalConfig] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: (() => Promise<void>) | null;
    isProcessing: boolean;
  }>({
    show: false,
    title: '',
    message: '',
    action: null,
    isProcessing: false,
  });

  useEffect(() => {
    let ignore = false;
    async function loadDevData() {
      try {
        const [fetchedKeys, fetchedStatuses, botSettings, fetchedAnnouncements] =
          await Promise.all([
            devService.getKeys(),
            devService.getStatuses(),
            devService.getBotSettings(),
            devService.getAnnouncements(),
          ]);

        if (ignore) return;
        if (Array.isArray(fetchedKeys)) setKeys(fetchedKeys);
        if (Array.isArray(fetchedStatuses)) setStatuses(fetchedStatuses);
        if (botSettings.status_rotation_mode)
          setRotationMode(botSettings.status_rotation_mode);
        if (botSettings.presence_interval_seconds)
          setRotationInterval(String(botSettings.presence_interval_seconds));
        if (Array.isArray(fetchedAnnouncements))
          setAnnouncements(fetchedAnnouncements);
      } catch (err) {
        console.error('Error fetching dev data:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    loadDevData();
    return () => {
      ignore = true;
    };
  }, []);

  // --- Keys ---
  const handleGenerate = async () => {
    setGenerating(true);
    const daysToGenerate =
      duration === 'custom' ? parseInt(customDays, 10) : parseInt(duration, 10);
    try {
      await devService.generateKey(
        daysToGenerate,
        parseInt(maxUses, 10),
        parseInt(tier, 10)
      );
      addToast('New premium key generated!', 'success');
      const newKeys = await devService.getKeys();
      setKeys(newKeys);
    } catch (err: any) {
      addToast(err?.message || 'Failed to generate key', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteKey = async (code: string) => {
    try {
      await devService.deleteKey(code);
      setKeys((prev) => prev.filter((k) => k.code !== code));
      addToast('Key deleted', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeKey = async (code: string) => {
    try {
      await devService.revokeKey(code);
      setKeys((prev) =>
        prev.map((k) => (k.code === code ? { ...k, is_revoked: true } : k))
      );
      addToast('Key revoked', 'warning');
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopying(text);
    addToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopying(null), 2000);
  };

  // --- Bot Status ---
  const handleAddStatus = async () => {
    if (!newStatusText.trim()) return;
    setStatusLoading(true);
    try {
      await devService.addStatus(newStatusType, newStatusText);
      setNewStatusText('');
      const fetchedStatuses = await devService.getStatuses();
      setStatuses(fetchedStatuses);
      addToast('Status pattern added', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleDeleteStatus = async (id: number) => {
    try {
      await devService.deleteStatus(id);
      setStatuses((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // --- Announcements ---
  const handleSendAnnouncement = async () => {
    if (!newAnnounce.title || !newAnnounce.content) return;
    setAnnounceLoading(true);
    try {
      await devService.addAnnouncement(newAnnounce);
      setNewAnnounce({ title: '', content: '', type: 'info' });
      const fetchedAnnouncements = await devService.getAnnouncements();
      setAnnouncements(fetchedAnnouncements);
      addToast('Announcement broadcasted!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setAnnounceLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    try {
      await devService.deleteAnnouncement(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      addToast('Announcement removed', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const openNuclearResetModal = () => {
    setModalConfig({
      show: true,
      title: 'Nuclear History Reset',
      message: 'Are you absolutely sure? Every monitor on every server will re-broadcast its latest post.',
      action: async () => {
        await devService.resetHistory();
        addToast('Nuclear reset completed', 'success');
      },
      isProcessing: false,
    });
  };

  const handleConfirmModal = async () => {
    if (modalConfig.action) {
      try {
        setModalConfig((prev) => ({ ...prev, isProcessing: true }));
        await modalConfig.action();
      } catch (err: any) {
        addToast(err?.message || 'Action failed', 'error');
      } finally {
        setModalConfig((prev) => ({ ...prev, show: false, isProcessing: false }));
      }
    } else {
      setModalConfig((prev) => ({ ...prev, show: false }));
    }
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, show: false }));
  };

  return {
    loading,
    keys,
    duration,
    setDuration,
    customDays,
    setCustomDays,
    maxUses,
    setMaxUses,
    tier,
    setTier,
    generating,
    copying,
    handleGenerate,
    handleDeleteKey,
    handleRevokeKey,
    copyToClipboard,
    showBroadcast,
    setShowBroadcast,
    showPresence,
    setShowPresence,
    showPremium,
    setShowPremium,
    showMaintenance,
    setShowMaintenance,
    statuses,
    rotationMode,
    setRotationMode,
    rotationInterval,
    setRotationInterval,
    newStatusType,
    setNewStatusType,
    newStatusText,
    setNewStatusText,
    statusLoading,
    handleAddStatus,
    handleDeleteStatus,
    announcements,
    newAnnounce,
    setNewAnnounce,
    announceLoading,
    handleSendAnnouncement,
    handleDeleteAnnouncement,
    modalConfig,
    setModalConfig,
    openNuclearResetModal,
    handleConfirmModal,
    handleCloseModal,
  };
}
