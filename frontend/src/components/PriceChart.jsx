import { ComposedChart, Line, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function PriceChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="chart-empty">No price history available for this ticker.</p>;
  }

  // 7-day algorithmic target zone projection
  const lastPoint = data[data.length - 1];
  const lastPrice = lastPoint.close;
  
  let lastDate = new Date();
  if (lastPoint.date) {
    const parsed = Date.parse(lastPoint.date);
    if (!isNaN(parsed)) {
      lastDate = new Date(parsed);
    }
  }

  const chartData = data.map(point => ({
    ...point,
    bull: null,
    bear: null
  }));

  // Connect the last historical point with the start of the projection area
  chartData[chartData.length - 1].bull = lastPrice;
  chartData[chartData.length - 1].bear = lastPrice;

  // Append 7 projected days
  for (let i = 1; i <= 7; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    const dateString = nextDate.toISOString().split('T')[0];
    
    // Funnel widening out: Bull case +1.5% * sqrt(i), Bear case -1.5% * sqrt(i)
    const bullVal = lastPrice * (1 + (0.015 * Math.sqrt(i)));
    const bearVal = lastPrice * (1 - (0.015 * Math.sqrt(i)));

    chartData.push({
      date: dateString,
      close: null,
      bull: parseFloat(bullVal.toFixed(2)),
      bear: parseFloat(bearVal.toFixed(2)),
      isProjection: true
    });
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData}>
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
              background: '#0f172a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
            itemStyle={{ color: '#cbd5e1' }}
            formatter={(value, name) => {
              if (name === 'close') return [`$${value}`, 'Price'];
              if (name === 'bull') return [`$${value}`, 'Target (Bull Case)'];
              if (name === 'bear') return [`$${value}`, 'Target (Bear Case)'];
              return [value, name];
            }}
          />
          {/* Light secondary shaded band projecting the target zone */}
          <Area
            type="monotone"
            dataKey="bear"
            stroke="none"
            fill="rgba(79, 140, 255, 0.12)"
            activeDot={false}
          />
          <Area
            type="monotone"
            dataKey="bull"
            stroke="none"
            fill="rgba(79, 140, 255, 0.12)"
            activeDot={false}
          />
          {/* Dashed target boundary lines */}
          <Line
            type="monotone"
            dataKey="bull"
            stroke="#10b981"
            strokeDasharray="3 3"
            strokeWidth={1}
            dot={false}
            activeDot={false}
          />
          <Line
            type="monotone"
            dataKey="bear"
            stroke="#ef4444"
            strokeDasharray="3 3"
            strokeWidth={1}
            dot={false}
            activeDot={false}
          />
          {/* Main historical price line */}
          <Line
            type="monotone"
            dataKey="close"
            stroke="url(#lineGlow)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4, fill: '#4f8cff' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
