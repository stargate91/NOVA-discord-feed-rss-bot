export interface CustomBrandingConfig {
  bot_name?: string | null;
  bot_avatar?: string | null;
  embed_color?: string | null;
  footer_text?: string | null;
  footer_icon?: string | null;
  [key: string]: any;
}

export function parseCustomBranding(raw: any): CustomBrandingConfig {
  if (typeof raw === 'object' && raw !== null) {
    return raw;
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

export function updateBrandingField(
  current: CustomBrandingConfig,
  key: string,
  val: any
): CustomBrandingConfig {
  return {
    ...current,
    [key]: val === '' ? null : val,
  };
}
