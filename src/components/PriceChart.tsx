import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PricePoint, Market } from "@/data/mockMarkets";
import { useState } from "react";
import { cn } from "@/lib/utils";

const timeRanges = ["1D", "1W", "1M", "ALL"] as const;
type TimeRange = typeof timeRanges[number];

const chartColors = [
  "hsl(var(--chart-line-1))",
  "hsl(var(--chart-line-2))",
  "hsl(var(--chart-line-3))",
  "hsl(var(--chart-yes))",
  "hsl(var(--chart-no))",
];

interface PriceChartProps {
  data: PricePoint[];
  market: Market;
}

export const PriceChart = ({ data, market }: PriceChartProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>("ALL");

  const getFilteredData = () => {
    const now = new Date();
    let filterDate = new Date();

    switch (timeRange) {
      case "1D":
        filterDate.setDate(now.getDate() - 1);
        break;
      case "1W":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "1M":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return data;
    }

    return data.filter((point) => new Date(point.date) >= filterDate);
  };

  const filteredData = getFilteredData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-xl">
          <p className="mb-2 text-xs text-muted-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm font-semibold"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        {market.outcomes.map((outcome, idx) => (
          <div key={outcome.id} className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: chartColors[idx % chartColors.length] }}
            />
            <span className="text-sm text-muted-foreground">
              {outcome.name}{" "}
              <span className="font-semibold text-foreground">
                {outcome.probability}%
              </span>
            </span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
              }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              tickLine={false}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            {market.outcomes.map((outcome, idx) => (
              <Line
                key={outcome.id}
                type="monotone"
                dataKey={outcome.name}
                stroke={chartColors[idx % chartColors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center gap-1">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
              timeRange === range
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
};
