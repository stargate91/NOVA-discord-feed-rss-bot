"use client";

import React, { useMemo } from "react";
import {
  HeatmapItem,
  buildHeatmapGrid,
  getHeatmapCellColor,
  HEATMAP_DAYS,
  HEATMAP_HOURS,
  HEATMAP_LAYOUT,
  getHeatmapCellCoordinates,
  getHeatmapHeaderCoordinates,
  getHeatmapDayLabelCoordinates,
} from "@/utils/heatmap";
import styles from "./heatmap_chart.module.css";

export type { HeatmapItem };

interface HeatmapChartProps {
  data: HeatmapItem[];
}

export default function HeatmapChart({ data }: HeatmapChartProps) {
  // Initialize grid with 0s
  const grid = useMemo(() => buildHeatmapGrid(data), [data]);

  return (
    <div className={styles["heatmap-container"]}>
      <svg 
        viewBox={`0 0 ${HEATMAP_LAYOUT.TOTAL_WIDTH} ${HEATMAP_LAYOUT.TOTAL_HEIGHT}`} 
        className={styles["heatmap-svg"]}
        role="img"
        aria-label="Activity heatmap chart"
      >
        {/* Hour Header Labels */}
        {HEATMAP_HOURS.filter((h) => h % 3 === 0).map((h) => {
          const coords = getHeatmapHeaderCoordinates(h);
          return (
            <text
              key={h}
              x={coords.x}
              y={coords.y}
              textAnchor="middle"
              className={styles["hour-label"]}
            >
              {h}:00
            </text>
          );
        })}

        {/* Rows and Cells */}
        {HEATMAP_DAYS.map((day, dIdx) => {
          const labelCoords = getHeatmapDayLabelCoordinates(dIdx);
          return (
            <g key={day}>
              <text
                x={labelCoords.x}
                y={labelCoords.y}
                textAnchor="end"
                className={styles["day-label"]}
              >
                {day}
              </text>
              {HEATMAP_HOURS.map((hour) => {
                const count = grid.matrix[dIdx][hour];
                const cellColor = getHeatmapCellColor(count, grid.max);
                const { x, y } = getHeatmapCellCoordinates(dIdx, hour);

                return (
                  <rect
                    key={hour}
                    x={x}
                    y={y}
                    width={HEATMAP_LAYOUT.CELL_WIDTH}
                    height={HEATMAP_LAYOUT.CELL_HEIGHT}
                    rx={4}
                    fill={cellColor}
                  >
                    <title>{`${day}, ${hour}:00 - ${count} messages`}</title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className={styles["legend-row"]}>
        <span>Less</span>
        <div className={styles["legend-cells"]}>
          <div className={`${styles["legend-swatch"]} ${styles["swatch-0"]}`} />
          <div className={`${styles["legend-swatch"]} ${styles["swatch-1"]}`} />
          <div className={`${styles["legend-swatch"]} ${styles["swatch-2"]}`} />
          <div className={`${styles["legend-swatch"]} ${styles["swatch-3"]}`} />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
