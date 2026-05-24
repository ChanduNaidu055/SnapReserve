import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "./index.css";

const COLORS = ["#00bcd4", "#ff4081", "#7c4dff"];

const RevenueAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({ monthlyRevenue: [], packageBreakdown: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get("/api/analytics/revenue");
        setAnalyticsData({
          monthlyRevenue: Array.isArray(response.data?.monthlyRevenue) ? response.data.monthlyRevenue : [],
          packageBreakdown: Array.isArray(response.data?.packageBreakdown) ? response.data.packageBreakdown : []
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed parsing telemetry metrics", err);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div style={{ color: "#00bcd4", padding: "40px" }}>Compiling financial metrics...</div>;

  const monthlyData = analyticsData?.monthlyRevenue || [];
  const breakdownData = analyticsData?.packageBreakdown || [];

  return (
    <div className="analytics-workspace animate-fade-in">
      <div className="analytics-header">
        <h1>Financial Dashboard</h1>
        <p>Studio revenue and package performance.</p>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Monthly Revenue Gross</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" stroke="#a0a0a0" />
                <YAxis stroke="#a0a0a0" />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }}
                />
                <Bar dataKey="revenue" fill="#00bcd4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Revenue by Category</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={breakdownData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend-pills">
              {breakdownData.map((pkg, i) => (
                <span key={pkg.name} style={{ borderBottom: `2px solid ${COLORS[i]}` }}>
                  {pkg.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueAnalytics;