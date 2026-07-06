import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PriceChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="chart-empty">No price history available for this ticker.</p>;
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f8cff" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#616d8f', fontSize: 11 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#616d8f', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={['auto', 'auto']}
            width={50}
          />
          <Tooltip
            contentStyle={{
              background: 'rgba(10,14,26,0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#9aa4c0' }}
            itemStyle={{ color: '#f4f6fb' }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="url(#lineGlow)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#4f8cff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
