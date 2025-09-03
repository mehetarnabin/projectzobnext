import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Copy, Check, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

const emailTemplates = [
  {
    id: '1',
    name: 'Formal Invitation',
    subject: "You're Invited: {eventTitle}",
    content: 'We cordially invite you to attend {eventTitle} on {eventDate} at {eventLocation}. This formal event promises to be an elegant and memorable occasion.',
    imageUrl: 'https://via.placeholder.com/400x200?text=Formal',
  },
  {
    id: '2',
    name: 'Casual Meetup',
    subject: 'Join us for {eventTitle}!',
    content: "Hey there! We'd love to have you join us for {eventTitle}. It's going to be a fun and relaxed gathering on {eventDate} at {eventLocation}.",
    imageUrl: 'https://via.placeholder.com/400x200?text=Casual',
  },
  {
    id: '3',
    name: 'Business Professional',
    subject: 'Professional Event: {eventTitle}',
    content: "You are invited to participate in {eventTitle}, a professional networking event scheduled for {eventDate} at {eventLocation}. Don't miss this opportunity to connect and grow.",
    imageUrl: 'https://via.placeholder.com/400x200?text=Business',
  },
  {
    id: '4',
    name: 'Creative & Fun',
    subject: '🎉 Get Ready for {eventTitle}!',
    content: 'Get ready for an amazing experience! {eventTitle} is happening on {eventDate} at {eventLocation}. Bring your creativity and energy!',
    imageUrl: 'https://via.placeholder.com/400x200?text=Creative',
  },
];

export function ShareEventModal({ isOpen, onClose, event }) {
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const generateShareLink = () => `${window.location.origin}/event/${event.id}`;

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(generateShareLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Link Copied',
        description: 'Event share link copied to clipboard',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy link',
        variant: 'destructive',
      });
    }
  };

  const sendInvitations = async () => {
    if (!selectedTemplate || !senderName || !senderEmail) {
      toast({
        title: "Missing Information",
        description: "Please select a template and fill in sender details",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/events/${event.id}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          subject: selectedTemplate.subject.replace("{eventTitle}", event.title),
          message: customMessage,
        }),
      });

      if (!response.ok) throw new Error("Failed to send invitations");

      toast({
        title: "Invitations Sent!",
        description: "Successfully sent invitations",
      });

      onClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const getPreviewContent = () => {
    if (!selectedTemplate) return '';
    return selectedTemplate.content
      .replace('{eventTitle}', event.title)
      .replace('{eventDate}', new Date(event.date).toLocaleDateString())
      .replace('{eventLocation}', event.location);
  };

  // Social media share URLs
  const shareOnSocialMedia = (platform) => {
    const url = encodeURIComponent(generateShareLink());
    const text = encodeURIComponent(`${event.title} - ${customMessage || ''}`);
    let shareUrl = '';

    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default: return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-3/4 max-w-[90vw] bg-white rounded-4xl shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#003893] flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share Event: {event.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Left: Email Templates */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Choose Email Template</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {emailTemplates.map(template => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'ring-2 ring-primary shadow-lg transform scale-105'
                      : 'hover:scale-102'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardContent className="p-3">
                    <div className="aspect-video rounded-md overflow-hidden mb-2">
                      <img src={template.imageUrl} alt={template.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-medium text-sm text-center">{template.name}</h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: Sender & Link */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="senderName">Sender Name *</Label>
              <Input id="senderName" value={senderName} onChange={e => setSenderName(e.target.value)} className="mt-1 w-full border-gray-200 rounded-4xl p-2" />
            </div>

            <div>
              <Label htmlFor="senderEmail">Sender Email *</Label>
              <Input id="senderEmail" type="email" value={senderEmail} onChange={e => setSenderEmail(e.target.value)} className="mt-1 w-full border-gray-200 rounded-4xl p-2" />
            </div>

            <div>
              <Label className="text-base font-medium">Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input value={generateShareLink()} readOnly className="text-xs w-full border-gray-200 rounded-4xl p-2" />
                <Button size="sm" onClick={copyShareLink} variant={copied ? 'success' : 'outline'} className="rounded-4xl border-gray-200 hover:bg-[#003893] hover:text-white">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="customMessage">Custom Message</Label>
              <Textarea id="customMessage" value={customMessage} onChange={e => setCustomMessage(e.target.value)} className="mt-1 w-full border-gray-200 rounded-4xl p-2" rows={3} />
            </div>

            {/* Social Media Share */}
            <div className="flex gap-3 mt-2">
              <Button onClick={() => shareOnSocialMedia('facebook')} variant="outline" className="flex-1 text-[#003893] border-gray-200 rounded-4xl hover:bg-[#003893] hover:text-white">
                <Facebook className="h-4 w-4 mr-2" /> Facebook
              </Button>
              <Button onClick={() => shareOnSocialMedia('twitter')} variant="outline" className="flex-1 text-[#003893] border-gray-200 rounded-4xl hover:bg-[#003893] hover:text-white">
                <Twitter className="h-4 w-4 mr-2" /> Twitter
              </Button>
              <Button onClick={() => shareOnSocialMedia('linkedin')} variant="outline" className="flex-1 text-[#003893] border-gray-200 rounded-4xl hover:bg-[#003893] hover:text-white">
                <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
              </Button>
            </div>

            {/* Email Preview */}
            {selectedTemplate && (
              <div className="p-4 bg-muted rounded-lg mt-2">
                <Label className="text-sm font-medium">Email Preview</Label>
                <div className="mt-2 p-3 bg-background rounded border text-sm">
                  <div className="font-medium mb-2">
                    Subject: {selectedTemplate.subject.replace('{eventTitle}', event.title)}
                  </div>
                  <div className="text-muted-foreground">
                    {getPreviewContent()}
                    {customMessage && <div className="mt-2 pt-2 border-t italic">{customMessage}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-6 border-t mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 text-[#003893] border-gray-200 rounded-4xl hover:bg-[#003893] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={sendInvitations}
            variant="outline"
            className="flex-1 text-[#003893] border-gray-200 rounded-4xl hover:bg-[#003893] hover:text-white"
          >
            Send Invitations
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
