import { useState, useEffect, useCallback } from 'react';
import devService, { AnnouncementItem } from '@/services/dev_service';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [closedIds, setClosedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const fetchAnnouncements = async () => {
      try {
        const data = await devService.getAnnouncements();
        if (!ignore && Array.isArray(data)) {
          setAnnouncements(data);
        }
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchAnnouncements();

    return () => {
      ignore = true;
    };
  }, []);

  const closeAnnouncement = useCallback((id: number) => {
    setClosedIds((prev) => [...prev, id]);
  }, []);

  const activeAnnouncements = announcements.filter(
    (a) => !closedIds.includes(a.id)
  );

  return {
    announcements,
    activeAnnouncements,
    loading,
    closeAnnouncement,
  };
}
