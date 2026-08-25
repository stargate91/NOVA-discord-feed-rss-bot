"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, AlertCircle, X, Megaphone } from "lucide-react";
import devService, { AnnouncementItem } from "@/services/devService";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [closedIds, setClosedIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const data = await devService.getAnnouncements();
        if (Array.isArray(data)) setAnnouncements(data);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  const closeAnnouncement = (id: number) => {
    setClosedIds(prev => [...prev, id]);
  };

  const activeAnnouncements = announcements.filter(a => !closedIds.includes(a.id));

  if (activeAnnouncements.length === 0) return null;

  return (
    <div className="ui-quick-action-list" style={{ marginBottom: '2rem' }}>
      {activeAnnouncements.map((a) => (
        <div key={a.id} className={`ui-banner ui-banner-${a.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white' }}>
              {a.type === 'alert' && <AlertCircle size={22} style={{ color: '#ef4444' }} />}
              {a.type === 'warning' && <AlertTriangle size={22} style={{ color: '#f59e0b' }} />}
              {a.type === 'info' && <Megaphone size={22} style={{ color: '#3b82f6' }} />}
              {a.type === 'maintenance' && <AlertTriangle size={22} style={{ color: '#ec4899' }} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="ui-form-label" style={{ margin: 0, color: 'white' }}>{a.title}</span>
              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{a.content}</p>
            </div>
          </div>
          <button 
            className="ui-modal-close"
            style={{ position: 'relative', top: 'auto', right: 'auto' }}
            onClick={() => closeAnnouncement(a.id)}
          >
            <X size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
