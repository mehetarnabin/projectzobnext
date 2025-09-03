<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;


class EventController extends Controller
{
    private function transform(Event $event)
{
    return [
        'id'            => $event->id,
        'title'         => $event->title,
        'description'   => $event->description,
        'date'          => $event->start_time ? date('Y-m-d', strtotime($event->start_time)) : null,
        'time'          => $event->start_time ? date('H:i', strtotime($event->start_time)) : null,
        'end_date'      => $event->end_time ? date('Y-m-d', strtotime($event->end_time)) : null,
        'end_time'      => $event->end_time ? date('H:i', strtotime($event->end_time)) : null,
        'location'      => $event->location,
        'organizer'     => $event->organizer,
        'category'      => $event->category,
        
        'tags'          => $event->tags,
    ];
}

    public function index()
{
    return response()->json(Event::all()->map(fn($event) => $this->transform($event)));
}

public function show($id)
{
    $event = Event::findOrFail($id);
    return response()->json($this->transform($event));
}


    

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'required|date',
            'time'        => 'required|date_format:H:i',
            'end_date'    => 'nullable|date',
            'end_time'    => 'nullable|date_format:H:i',
            'location'    => 'nullable|string|max:255',
            'organizer'   => 'nullable|string|max:255',
            'category'    => ['required', Rule::in(['upcoming', 'ongoing', 'completed'])],
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tags'        => 'nullable|array',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('events', 'public');
        }

        $event = Event::create([
            'title'       => $validated['title'],
            'description' => $validated['description'] ?? null,
            'start_time'  => $validated['date'] . ' ' . $validated['time'],
            'end_time'    => (!empty($validated['end_date']) && !empty($validated['end_time']))
                                ? $validated['end_date'] . ' ' . $validated['end_time']
                                : null,
            'location'    => $validated['location'] ?? null,
            'organizer'   => $validated['organizer'] ?? null,
            'category'    => $validated['category'],
            'image_url'   => $imagePath,
            'tags'        => $validated['tags'] ?? [],
        ]);

        return response()->json($this->transform($event), 201);
    }

    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'date'        => 'nullable|date',
            'time'        => 'nullable|date_format:H:i',
            'end_date'    => 'nullable|date',
            'end_time'    => 'nullable|date_format:H:i',
            'location'    => 'nullable|string|max:255',
            'organizer'   => 'nullable|string|max:255',
            'category'    => ['nullable', Rule::in(['upcoming', 'ongoing', 'completed'])],
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tags'        => 'nullable|array',
        ]);

        $imagePath = $event->image_url;
        if ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('events', 'public');
        }

        $event->update([
            'title'       => $validated['title'] ?? $event->title,
            'description' => $validated['description'] ?? $event->description,
            'start_time'  => (!empty($validated['date']) && !empty($validated['time']))
                                ? $validated['date'] . ' ' . $validated['time']
                                : $event->start_time,
            'end_time'    => (!empty($validated['end_date']) && !empty($validated['end_time']))
                                ? $validated['end_date'] . ' ' . $validated['end_time']
                                : $event->end_time,
            'location'    => $validated['location'] ?? $event->location,
            'organizer'   => $validated['organizer'] ?? $event->organizer,
            'category'    => $validated['category'] ?? $event->category,
            'image_url'   => $imagePath,
            'tags'        => $validated['tags'] ?? $event->tags,
        ]);

        return response()->json($this->transform($event));
    }

public function destroy($id)
{
    $event = Event::find($id);

    if (!$event) {
        return response()->json(['message' => 'Event not found'], 404);
    }

    $event->delete();

    return response()->json(['message' => 'Event deleted successfully']);
}



public function share(Request $request, $id)
{
    $event = Event::findOrFail($id);

    $validated = $request->validate([
        'senderName'    => 'required|string|max:255',
        'senderEmail'   => 'required|email',
        'recipients'    => 'required|array|min:1',
        'recipients.*'  => 'email',
        'subject'       => 'required|string|max:255',
        'message'       => 'nullable|string',
    ]);

    foreach ($validated['recipients'] as $recipient) {
        Mail::send('emails.event-invite', [
            'event'       => $event,
            'senderName'  => $validated['senderName'],
            'customMsg'   => $validated['message'] ?? '',
        ], function ($mail) use ($recipient, $validated) {
            $mail->to($recipient)
                ->from($validated['senderEmail'], $validated['senderName'])
                ->subject($validated['subject']);
        });
    }

    return response()->json([
        'message' => 'Invitations sent successfully',
        'recipients' => $validated['recipients'],
    ]);
}


}
