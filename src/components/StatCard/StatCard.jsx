// src\components\StatCard\StatCard.jsx

"use client"



const StatCard = ({ icon, title, value, subtitle, color }) => {
  const getColorClass = () => {
    switch (color) {
      case "blue":
        return "bg-primary"
      case "green":
        return "bg-success"
      case "orange":
        return "bg-warning"
      case "purple":
        return "bg-purple"
      default:
        return "bg-primary"
    }
  }

  return (
    <div className={`stat-card ${color}`}>
      <div className={`stat-icon ${getColorClass()}`}>{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle">{subtitle}</div>
      </div>
    </div>
  )
}

export default StatCard
