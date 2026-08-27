import { describe, it, expect } from 'vitest';
import { flattenDictionary, getPluralCategory } from '@/i18n/utils';

describe('i18n Utilities Tests', () => {
  it('should recursively flatten nested dictionary objects into dot notation', () => {
    const nested = {
      common: {
        brandName: 'Nova Feeds',
        buttons: {
          save: 'Save Changes',
          cancel: 'Cancel',
        },
      },
      dashboard: {
        title: 'Dashboard Overview',
      },
    };

    const flat = flattenDictionary(nested);
    expect(flat['common.brandName']).toBe('Nova Feeds');
    expect(flat['common.buttons.save']).toBe('Save Changes');
    expect(flat['common.buttons.cancel']).toBe('Cancel');
    expect(flat['dashboard.title']).toBe('Dashboard Overview');
  });

  it('should determine ICU plural rule categories for various languages and counts', () => {
    expect(getPluralCategory('en', 1)).toBe('one');
    expect(getPluralCategory('en', 5)).toBe('other');
    expect(getPluralCategory('en', 0)).toBe('other');

    expect(getPluralCategory('ru', 1)).toBe('one');
    expect(getPluralCategory('ru', 2)).toBe('few');
    expect(getPluralCategory('ru', 5)).toBe('many');
  });
});
