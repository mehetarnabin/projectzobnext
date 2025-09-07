


  // Use backend-provided URL directly or fallback to placeholder
  

  // EventCard.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Share2, Edit, Trash } from "lucide-react";

const EventCard = ({ event, onEdit, onDelete, onShare }) => {
  const formattedDate = event.date
    ? new Date(event.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : "TBA";

    const imageSrc = event.imageUrl || "https://via.placeholder.com/400x200?text=No+Image";

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow rounded-2xl border border-gray-200">
      {/* Event image */}
      {event.imageUrl && (
        <div className="h-40 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-1">
          {event.title}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Event info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{event.time}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-between pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onShare(event)}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(event)}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(event.id)}
              className="flex items-center gap-1"
            >
              <Trash className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;