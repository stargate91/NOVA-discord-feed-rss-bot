export interface HeatmapItem {
  day: number;
  hour: number;
  count: number;
}

export interface HeatmapMatrixResult {
  matrix: number[][];
  max: number;
}

/**
 * Builds a 7x24 matrix for weekday vs hour message distribution.
 */
export function buildHeatmapGrid(data: HeatmapItem[]): HeatmapMatrixResult {
  const matrix: number[][] = Array(7).fill(0).map(() => Array(24).fill(0));
  let max = 0;

  if (Array.isArray(data)) {
    data.forEach(item => {
      if (matrix[item.day] && item.hour >= 0 && item.hour < 24) {
        matrix[item.day][item.hour] = item.count;
        if (item.count > max) max = item.count;
      }
    });
  }

  return { matrix, max: max || 1 };
}

/**
 * Computes an RGBA background color for a given count based on max density.
 */
export function getHeatmapCellColor(count: number, max: number): string {
  if (count === 0) return "rgba(255, 255, 255, 0.03)";
  const opacity = 0.1 + (count / (max || 1)) * 0.9;
  return `rgba(123, 44, 191, ${opacity})`;
}

export const HEATMAP_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
export const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => i);

export const HEATMAP_LAYOUT = {
  CELL_WIDTH: 24,
  CELL_HEIGHT: 20,
  GAP: 4,
  LEFT_OFFSET: 40,
  TOP_OFFSET: 24,
  TOTAL_WIDTH: 40 + 24 * (24 + 4), // 712
  TOTAL_HEIGHT: 24 + 7 * (20 + 4), // 192
} as const;

export function getHeatmapCellCoordinates(dayIndex: number, hourIndex: number) {
  const x = HEATMAP_LAYOUT.LEFT_OFFSET + hourIndex * (HEATMAP_LAYOUT.CELL_WIDTH + HEATMAP_LAYOUT.GAP);
  const y = HEATMAP_LAYOUT.TOP_OFFSET + dayIndex * (HEATMAP_LAYOUT.CELL_HEIGHT + HEATMAP_LAYOUT.GAP);
  return { x, y };
}

export function getHeatmapHeaderCoordinates(hourIndex: number) {
  const x = HEATMAP_LAYOUT.LEFT_OFFSET + hourIndex * (HEATMAP_LAYOUT.CELL_WIDTH + HEATMAP_LAYOUT.GAP) + HEATMAP_LAYOUT.CELL_WIDTH / 2;
  return { x, y: 14 };
}

export function getHeatmapDayLabelCoordinates(dayIndex: number) {
  const x = HEATMAP_LAYOUT.LEFT_OFFSET - 8;
  const y = HEATMAP_LAYOUT.TOP_OFFSET + dayIndex * (HEATMAP_LAYOUT.CELL_HEIGHT + HEATMAP_LAYOUT.GAP) + HEATMAP_LAYOUT.CELL_HEIGHT / 2 + 4;
  return { x, y };
}
