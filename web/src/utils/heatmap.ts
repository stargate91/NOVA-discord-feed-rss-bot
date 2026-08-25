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
