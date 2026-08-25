"use client";
import React, { useMemo } from "react";
import { HeatmapItem, buildHeatmapGrid, getHeatmapCellColor } from "@/utils/heatmap";

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

  return (
    <div className="ui-heatmap-container">
      <div className="ui-heatmap-header">
        <div className="ui-heatmap-hour-labels">
          {hours.filter(h => h % 3 === 0).map(h => (
            <span key={h} className="ui-heatmap-hour-label" style={{ left: `${(h / 24) * 100}%` }}>
              {h}:00
            </span>
          ))}
        </div>
      </div>
      
      <div className="ui-heatmap-grid">
        {days.map((day, dIdx) => (
          <div key={day} className="ui-heatmap-row">
            <span className="ui-heatmap-day">{day}</span>
            <div className="ui-heatmap-cells">
              {hours.map(hour => {
                const count = grid.matrix[dIdx][hour];
                return (
                  <div 
                    key={hour} 
                    className="ui-heatmap-cell"
                    style={{ background: getColor(count) }}
                    title={`${day}, ${hour}:00 - ${count} messages`}
                  >
                    {count > 0 && <div className="ui-heatmap-cell-glow" style={{ opacity: count / grid.max }}></div>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="ui-heatmap-legend">
        <span>Less</span>
        <div className="ui-heatmap-legend-cells">
          <div className="ui-heatmap-legend-cell" style={{ background: "rgba(255, 255, 255, 0.03)" }}></div>
          <div className="ui-heatmap-legend-cell" style={{ background: "rgba(123, 44, 191, 0.3)" }}></div>
          <div className="ui-heatmap-legend-cell" style={{ background: "rgba(123, 44, 191, 0.6)" }}></div>
          <div className="ui-heatmap-legend-cell" style={{ background: "rgba(123, 44, 191, 1)" }}></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
