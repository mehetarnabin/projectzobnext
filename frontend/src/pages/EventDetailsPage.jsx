// EventDetailsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Mail, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/useToast';
import api from '../api/axios'; // Your axios instance
import { Helmet } from 'react-helmet';

const EventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${id}`);
        setEvent(response.data);
      } catch (err) {
        console.error(err);
        toast({ title: 'Error', description: 'Failed to fetch event', variant: 'destructive' });
        navigate('/events'); // redirect if event not found
      }
    };
    fetchEvent();
  }, [id]);

  if (!event) return <p className="text-center mt-10">Loading event details...</p>;

  const shareUrl = `https://yourdomain.com/event/${event.id}`; // Replace with your deployed domain

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Link Copied', description: 'Event share link copied to clipboard' });
    } catch {
      toast({ title: 'Error', description: 'Failed to copy link', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      {/* Dynamic OG + Twitter Meta Tags */}
      <Helmet>
        <title>{event.title}</title>
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description || ''} />
        <meta property="og:image" content={event.imageUrl || ''} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={event.title} />
        <meta name="twitter:description" content={event.description || ''} />
        <meta name="twitter:image" content={event.imageUrl || ''} />
      </Helmet>

      <div className="container mx-auto px-6">
        {/* Event Image */}
        {event.imageUrl && (
          <div className="w-full h-64 md:h-96 overflow-hidden rounded-2xl shadow-lg mb-6">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Event Title & Actions */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
          <div className="flex gap-3">
            <Button
              onClick={copyLink}
              variant={copied ? 'success' : 'outline'}
              className="flex items-center gap-2 rounded-4xl"
            >
              <Share2 className="h-4 w-4" />
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="rounded-4xl">
              Go Back
            </Button>
          </div>
        </div>

        {/* Event Details */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <span>{event.location}</span>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>Organizer: {event.organizer}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        {event.description && (
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{event.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {event.tags.map((tag, idx) => (
              <span key={idx} className="bg-[#003893]/10 text-[#003893] px-3 py-1 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;
