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
import { useLang } from "@/i18n/LanguageContext";
import type { Tables } from "@/integrations/supabase/types";

interface ProgressChartProps {
  results: Tables<"diagnostics_results">[];
}

const CATEGORY_COLORS = {
  cognitive: "hsl(210, 80%, 60%)",
  soft: "hsl(150, 60%, 50%)",
  professional: "hsl(38, 92%, 55%)",
  adaptability: "hsl(280, 60%, 60%)",
  overall: "hsl(0, 0%, 75%)",
};

const ProgressChart = ({ results }: ProgressChartProps) => {
  const { t } = useLang();

  if (results.length < 2) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm text-center px-4">
        {t.progress.noData}
      </div>
    );
  }

  // Sort ascending by date
  const sorted = [...results].sort(
    (a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime()
  );

  const data = sorted.map((r) => ({
    date: new Date(r.completed_at).toLocaleDateString(),
    [t.categories.cognitive]: Math.round(r.cognitive_score),
    [t.categories.soft]: Math.round(r.soft_score),
    [t.categories.professional]: Math.round(r.professional_score),
    [t.categories.adaptability]: Math.round(r.adaptability_score),
    [t.progress.overall]: Math.round(r.average_score),
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid stroke="hsl(222, 25%, 18%)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "hsl(215, 15%, 55%)", fontSize: 11 }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(222, 40%, 10%)",
              border: "1px solid hsl(222, 25%, 18%)",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "hsl(210, 20%, 92%)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            iconType="circle"
            iconSize={8}
          />
          <Line
            type="monotone"
            dataKey={t.categories.cognitive}
            stroke={CATEGORY_COLORS.cognitive}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey={t.categories.soft}
            stroke={CATEGORY_COLORS.soft}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey={t.categories.professional}
            stroke={CATEGORY_COLORS.professional}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey={t.categories.adaptability}
            stroke={CATEGORY_COLORS.adaptability}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey={t.progress.overall}
            stroke={CATEGORY_COLORS.overall}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;
