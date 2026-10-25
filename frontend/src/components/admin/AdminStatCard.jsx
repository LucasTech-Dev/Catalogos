import MaterialIcon from "../ui/MaterialIcon";
import React from "react";

function AdminStatCard({ description, icon, label, value }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-top">
        <span className="admin-stat-icon"><MaterialIcon name={icon}/></span>
      </div>

      <div className="admin-stat-value">{value}</div>

      <h2>{label}</h2>

      <p>{description}</p>
    </article>
  );
}

export default AdminStatCard;
