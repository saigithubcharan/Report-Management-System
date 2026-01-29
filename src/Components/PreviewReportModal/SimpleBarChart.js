import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const data = [
  { name: "Electrical Wiring", max: 2, score: 1.5 },
  { name: "Grounding", max: 2, score: 2 },
  { name: "Switchboards", max: 2, score: 1.75 },
  { name: "Cables", max: 2, score: 1.25 },
];

const SimpleBarChart = () => (
  <BarChart width={600} height={300} data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar dataKey="max" fill="#006400" />
    <Bar dataKey="score" fill="#FFD700" />
  </BarChart>
);

export default SimpleBarChart;
