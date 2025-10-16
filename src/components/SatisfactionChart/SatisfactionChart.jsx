// src\components\SatisfactionChart\SatisfactionChart.jsx

"use client"

import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"


// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const SatisfactionChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulating data fetching
    setTimeout(() => {
      const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      setChartData({
        labels,
        datasets: [
          {
            label: "NPS Score",
            data: [35, 42, 38, 45, 50, 48, 52, 55, 58, 60, 58, 62],
            borderColor: "#4a6cf7",
            backgroundColor: "rgba(74, 108, 247, 0.5)",
            tension: 0.4,
          },
          {
            label: "Satisfaction Score",
            data: [4.1, 4.0, 3.8, 4.2, 4.3, 4.2, 4.4, 4.5, 4.6, 4.7, 4.6, 4.8],
            borderColor: "#fd7e14",
            backgroundColor: "rgba(253, 126, 20, 0.5)",
            yAxisID: "y1",
            tension: 0.4,
          },
        ],
      })

      setLoading(false)
    }, 1000)
  }, [])

  const options = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    stacked: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          color: "#6c757d",
        },
      },
      tooltip: {
        backgroundColor: "#FFF",
        titleColor: "#212529",
        bodyColor: "#6c757d",
        borderColor: "#dee2e6",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          labelPointStyle: () => ({
            pointStyle: "circle",
            rotation: 0,
          }),
        },
      },
    },
    scales: {
      y: {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "NPS Score",
          color: "#6c757d",
        },
        min: 0,
        max: 100,
        grid: {
          color: "#dee2e6",
        },
        ticks: {
          color: "#6c757d",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        title: {
          display: true,
          text: "Satisfaction (1-5)",
          color: "#6c757d",
        },
        min: 1,
        max: 5,
        grid: {
          drawOnChartArea: false,
          color: "#dee2e6",
        },
        ticks: {
          color: "#6c757d",
        },
      },
      x: {
        grid: {
          color: "#dee2e6",
        },
        ticks: {
          color: "#6c757d",
        },
      },
    },
  }

  if (loading) {
    return <div className="loading">Loading chart data...</div>
  }

  return (
    <div className="satisfaction-chart">
      <Line options={options} data={chartData} />
    </div>
  )
}

export default SatisfactionChart
