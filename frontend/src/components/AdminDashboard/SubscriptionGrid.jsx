// src/components/AdminDashboard/SubscriptionGrid.jsx
import React from "react";
import SubscriptionCard from "./SubscriptionCard";

const SubscriptionGrid = ({ plans = [], onEdit, onDelete }) => {
  if (!plans || plans.length === 0) return <p className="text-center text-muted-foreground">No subscription plans found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map(plan => (
        <SubscriptionCard key={plan.id} plan={plan} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};


export default SubscriptionGrid;
