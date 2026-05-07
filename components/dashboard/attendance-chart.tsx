"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type AttendanceChartProps = {
  data: {
    kelas: string;
    hadir: number;
    tidakHadir: number;
  }[];
};

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F1F3" vertical={false} />
        <XAxis dataKey="kelas" tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
            padding: "8px 12px",
            fontSize: "13px"
          }}
        />
        <Bar dataKey="hadir" name="Hadir" fill="#10B981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#F43F5E" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
