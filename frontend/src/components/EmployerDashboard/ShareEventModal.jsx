import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Facebook, Twitter, Linkedin, Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function ShareEventModal({ isOpen, onClose, event }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const shareUrl = `${window.location.origin}/event/${event.id}`;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(event.title);

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: 'Link Copied', description: 'Event link copied to clipboard' });
    } catch {
      toast({ title: 'Copy Failed', description: 'Failed to copy link', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-96 max-w-[90vw] bg-white rounded-2xl shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#003893] flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Event: {event.title}
          </DialogTitle>
        </DialogHeader>

        <Card className="mt-4">
          <CardContent className="flex flex-col gap-4 p-4">
            {/* Facebook */}
            <Button
              onClick={() => window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
                "_blank"
              )}
              className="w-full bg-[#1877F2] hover:bg-[#145db2] text-white flex items-center gap-2"
            >
              <Facebook className="h-5 w-5" /> Share on Facebook
            </Button>

            {/* Twitter */}
            <Button
              onClick={() => window.open(
                `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
                "_blank"
              )}
              className="w-full bg-[#1DA1F2] hover:bg-[#0d8ddb] text-white flex items-center gap-2"
            >
              <Twitter className="h-5 w-5" /> Share on Twitter
            </Button>

            {/* LinkedIn */}
            <Button
              onClick={() => window.open(
                `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
                "_blank"
              )}
              className="w-full bg-[#0A66C2] hover:bg-[#084c90] text-white flex items-center gap-2"
            >
              <Linkedin className="h-5 w-5" /> Share on LinkedIn
            </Button>

            {/* Copy Link */}
            <div className="flex gap-2 mt-2">
              <Input value={shareUrl} readOnly className="text-xs w-full border-gray-200 rounded-lg p-2" />
              <Button
                size="sm"
                onClick={copyShareLink}
                variant={copied ? 'success' : 'outline'}
                className="rounded-lg border-gray-200 hover:bg-[#003893] hover:text-white"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 text-[#003893] border-gray-200 rounded-lg hover:bg-[#003893] hover:text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
