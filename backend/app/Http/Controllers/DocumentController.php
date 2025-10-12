<?php

namespace App\Http\Controllers;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    // Get all documents for logged-in jobseeker (with optional search & category filter)
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = Document::where('user_id', $userId);

        // Optional search by name
        if ($request->has('search') && $request->search !== '') {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Optional filter by category
        if ($request->has('category') && $request->category !== '') {
            $query->where('category', $request->category);
        }

        // Optional filter by type (pdf, image, document)
        if ($request->has('type') && $request->type !== '') {
            $query->where('type', $request->type);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }


    // Upload new document
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:pdf,jpg,jpeg,png,gif,doc,docx|max:5120', // 5MB
            'category' => 'required|string'
        ]);

        $file = $request->file('file');
        $path = $file->store('documents', 'public');

        $document = Document::create([
            'user_id' => Auth::id(),
            'name' => $file->getClientOriginalName(),
            'path' => $path,
            'category' => $request->category,
            'type' => $file->extension(),
            'size' => round($file->getSize() / (1024 * 1024), 2) . 'MB',
            'date_uploaded' => now()->toDateString(),
        ]);

        return response()->json($document, 201);
    }

    // Update document (e.g. category, name)
    public function update(Request $request, $id)
    {
        $document = Document::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $request->validate([
            'category' => 'sometimes|string',
            'name' => 'sometimes|string'
        ]);

        if ($request->has('category')) {
            $document->category = $request->category;
        }

        if ($request->has('name')) {
            $document->name = $request->name;
        }

        $document->save();

        return response()->json($document);
    }

    // Delete document
    public function destroy($id)
    {
        $document = Document::where('id', $id)->where('user_id', Auth::id())->firstOrFail();

        Storage::disk('public')->delete($document->path);
        $document->delete();

        return response()->json(['message' => 'Document deleted successfully']);
    }
}
