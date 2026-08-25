"use client";

import React from 'react';
import MultiSelect from './multi_select';
import styles from './monitor_form_fields.module.css';

export interface MonitorDeliveryFieldsProps {
  guildChannels: Array<{ id: string; name: string }>;
  guildRoles: Array<{ id: string; name: string }>;
  targetChannels: string[];
  targetRoles: string[];
  onChangeChannels: (channels: string[]) => void;
  onChangeRoles: (roles: string[]) => void;
  loading?: boolean;
  disabledChannels?: boolean;
  disabledRoles?: boolean;
  className?: string;
  channelsPlaceholder?: string;
  rolesPlaceholder?: string;
}

export const MonitorDeliveryFields: React.FC<MonitorDeliveryFieldsProps> = ({
  guildChannels,
  guildRoles,
  targetChannels,
  targetRoles,
  onChangeChannels,
  onChangeRoles,
  loading = false,
  disabledChannels = false,
  disabledRoles = false,
  className,
  channelsPlaceholder,
  rolesPlaceholder,
}) => {
  return (
    <div className={className || styles["grid-2"]}>
      <div className={`${styles["form-group"]} ${disabledChannels ? styles["disabled"] : ''}`}>
        <span className={styles["form-label"]}>Target Channels</span>
        <MultiSelect
          options={guildChannels}
          value={targetChannels}
          onChange={onChangeChannels}
          placeholder={loading ? "Loading..." : (channelsPlaceholder || "Select channels")}
        />
      </div>
      <div className={`${styles["form-group"]} ${disabledRoles ? styles["disabled"] : ''}`}>
        <span className={styles["form-label"]}>Ping Roles</span>
        <MultiSelect
          options={guildRoles}
          value={targetRoles}
          onChange={onChangeRoles}
          placeholder={loading ? "Loading..." : (rolesPlaceholder || "Select roles")}
        />
      </div>
    </div>
  );
};

export default MonitorDeliveryFields;
