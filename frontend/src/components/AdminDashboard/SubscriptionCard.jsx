// src/components/AdminDashboard/SubscriptionCard.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Star } from "lucide-react";

const SubscriptionCard = ({ plan, onEdit, onDelete }) => {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-2xl border border-gray-200">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="text-lg font-semibold line-clamp-1">{plan.name}</CardTitle>
        {plan.recommended && <Star className="text-yellow-500 h-5 w-5" />}
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 font-bold text-xl">${plan.price}</p>
        <ul className="text-sm space-y-1">
          {plan.features && Object.entries(plan.features).map(([key, value], i) => (
            <li key={i} className="flex items-center gap-2">
              • {key}: {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(plan)} className="flex items-center gap-1">
            <Edit className="h-4 w-4" /> Edit
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(plan.id)} className="flex items-center gap-1">
            <Trash className="h-4 w-4" /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionCard;
