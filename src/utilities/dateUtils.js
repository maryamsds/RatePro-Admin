// utils/dateUtils.js
export const formatLocalDateTime = (dateString) => {
    if (!dateString || dateString === "—") return "—";
  
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };
  