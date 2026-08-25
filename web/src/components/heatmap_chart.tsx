"use client";

import React, { useMemo } from "react";
import { HeatmapItem, buildHeatmapGrid, getHeatmapCellColor } from "@/utils/heatmap";
import styles from "./heatmap_chart.module.css";

export type { HeatmapItem };

interface HeatmapChartProps {
  data: HeatmapItem[];
}

export default function HeatmapChart({ data }: HeatmapChartProps) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Initialize grid with 0s
  const grid = useMemo(() => buildHeatmapGrid(data), [data]);

  const getColor = (count: number) => getHeatmapCellColor(count, grid.max);

  const cellWidth = 24;
  const cellHeight = 20;
  const gap = 4;
  const leftOffset = 40;
  const topOffset = 24;
  const totalWidth = leftOffset + 24 * (cellWidth + gap);
  const totalHeight = topOffset + 7 * (cellHeight + gap);

  return (
    <div className={styles["heatmap-container"]}>
      <svg 
        viewBox={`0 0 ${totalWidth} ${totalHeight}`} 
        className={styles["heatmap-svg"]}
        role="img"
        aria-label="Activity heatmap chart"
      >
        {/* Hour Header Labels */}
        {hours.filter(h => h % 3 === 0).map(h => (
          <text
            key={h}
            x={leftOffset + h * (cellWidth + gap) + cellWidth / 2}
            y={14}
            textAnchor="middle"
            className={styles["hour-label"]}
          >
            {h}:00
          </text>
        ))}

        {/* Rows and Cells */}
        {days.map((day, dIdx) => (
          <g key={day}>
            <text
              x={leftOffset - 8}
              y={topOffset + dIdx * (cellHeight + gap) + cellHeight / 2 + 4}
              textAnchor="end"
              className={styles["day-label"]}
            >
              {day}
            </text>
            {hours.map(hour => {
              const count = grid.matrix[dIdx][hour];
              const cellColor = getColor(count);
              const xPos = leftOffset + hour * (cellWidth + gap);
              const yPos = topOffset + dIdx * (cellHeight + gap);

              return (
                <rect
                  key={hour}
                  x={xPos}
                  y={yPos}
                  width={cellWidth}
                  height={cellHeight}
                  rx={4}
                  fill={cellColor}
                >
                  <title>{`${day}, ${hour}:00 - ${count} messages`}</title>
                </rect>
              );
            })}
          </g>
        ))}
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
