<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>You're invited!</title>
</head>
<body>
    <p>Hello,</p>
    <p>{{ $senderName }} has invited you to the event: <strong>{{ $event->title }}</strong></p>
    
    @if(!empty($customMsg))
        <p>Message: {{ $customMsg }}</p>
    @endif

    <p>Event Details:</p>
    <ul>
        <li>Date: {{ $event->start_time }}</li>
        <li>Location: {{ $event->location ?? 'Not specified' }}</li>
    </ul>
</body>
</html>
