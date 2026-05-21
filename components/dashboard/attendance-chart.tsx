"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
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
        <Legend iconType="circle" wrapperStyle={{ color: "#4B5563", fontSize: 12, paddingTop: 12 }} />
        <Bar dataKey="hadir" name="Hadir" fill="#10B981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="tidakHadir" name="Tidak Hadir" fill="#F43F5E" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
