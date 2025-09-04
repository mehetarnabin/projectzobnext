// emailTemplates.jsx

export const EMAIL_TEMPLATES = [
  {
    id: 'formal-invitation',
    name: 'Formal Invitation',
    subject: 'Invitation to {eventTitle}',
    template: `Dear {recipientName},

You are cordially invited to attend {eventTitle}.

Event Details:
📅 Date: {eventDate}
🕐 Time: {eventTime}
📍 Location: {eventLocation}

{eventDescription}

We would be honored by your presence at this event.

Please confirm your attendance by replying to this email.

Best regards,
{senderName}

{eventLink}`,
    preview: 'A formal and professional invitation template perfect for corporate events and conferences.',
    category: 'formal'
  },
  {
    id: 'casual-meetup',
    name: 'Casual Meetup',
    subject: 'Hey! Join us for {eventTitle} 🎉',
    template: `Hi {recipientName}!

Hope you're doing well! I wanted to invite you to {eventTitle} - it's going to be awesome! 

Here are the deets:
📅 When: {eventDate} at {eventTime}
📍 Where: {eventLocation}

{eventDescription}

Would love to see you there! Let me know if you can make it 😊

Cheers,
{senderName}

Event link: {eventLink}`,
    preview: 'A friendly and casual invitation perfect for social gatherings and informal meetups.',
    category: 'casual'
  },
  {
    id: 'business-professional',
    name: 'Business Professional',
    subject: 'Invitation: {eventTitle} - {eventDate}',
    template: `Dear {recipientName},

I am pleased to invite you to {eventTitle}.

EVENT INFORMATION:
Date: {eventDate}
Time: {eventTime}
Venue: {eventLocation}

ABOUT THE EVENT:
{eventDescription}

This event presents an excellent opportunity for networking and professional development.

Please RSVP at your earliest convenience.

Kind regards,
{senderName}

Access event details: {eventLink}`,
    preview: 'A polished business template ideal for professional networking events and workshops.',
    category: 'professional'
  },
  {
    id: 'creative-fun',
    name: 'Creative & Fun',
    subject: '✨ You\'re Invited to Something Amazing! ✨',
    template: `Hey there, {recipientName}! 🌟

Get ready for an incredible experience at {eventTitle}!

🎭 What's Happening: {eventDescription}
🗓️ When the Magic Happens: {eventDate} at {eventTime}
🎯 Where to Find Us: {eventLocation}

This is going to be EPIC! Don't miss out on the fun! 🚀

Can't wait to see you there! 

With excitement,
{senderName} ✨

Ready to join? {eventLink}`,
    preview: 'An energetic and creative template perfect for parties, workshops, and creative events.',
    category: 'creative'
  },
  {
    id: 'workshop-educational',
    name: 'Workshop & Educational',
    subject: 'Learn & Grow: {eventTitle} Workshop',
    template: `Hello {recipientName},

You're invited to an enriching learning experience at {eventTitle}.

WORKSHOP DETAILS:
• Date: {eventDate}
• Time: {eventTime}
• Location: {eventLocation}

WHAT YOU'LL LEARN:
{eventDescription}

This workshop is designed to enhance your skills and knowledge. Come prepared to engage, learn, and network with like-minded individuals.

Space is limited, so please confirm your attendance soon.

Looking forward to learning together,
{senderName}

Register here: {eventLink}`,
    preview: 'An educational-focused template perfect for workshops, seminars, and training sessions.',
    category: 'professional'
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    subject: '{eventTitle}',
    template: `{recipientName},

{eventTitle}
{eventDate} | {eventTime}
{eventLocation}

{eventDescription}

{eventLink}

{senderName}`,
    preview: 'A clean, minimal template that focuses on essential information only.',
    category: 'professional'
  }
];
