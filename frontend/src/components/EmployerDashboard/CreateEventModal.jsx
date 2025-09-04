import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

export function CreateEventModal({ isOpen, onClose, onSave, editEvent }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    organizer: '',
    category: 'upcoming',
    imageUrl: '', // store image URL
    tags: [],
  });
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (editEvent) {
      setFormData({
        title: editEvent.title,
        description: editEvent.description,
        date: editEvent.date,
        time: editEvent.time,
        location: editEvent.location,
        organizer: editEvent.organizer,
        category: editEvent.category,
        imageUrl: editEvent.imageUrl || '',
        tags: editEvent.tags || [],
      });
      setImageFile(null);
    }
  }, [editEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      ...formData,
      image: imageFile, // <-- send the actual file here
    };
    onSave(eventData);


    toast({
      title: editEvent ? "Event Updated" : "Event Created",
      description: `${formData.title} has been ${editEvent ? 'updated' : 'created'} successfully`,
      variant: "default",
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-3/4 max-w-[90vw] bg-white rounded-4xl shadow-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#003893]">
            {editEvent ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

          {/* Left Column */}
          <div>
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
              className="mt-1 w-full border-gray-200 rounded-4xl p-2"
              required
            />

            <Label htmlFor="description" className="mt-4">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your event"
              className="mt-1 w-full min-h-[100px] border-gray-200 rounded-4xl p-2"
            />

            <Label htmlFor="date" className="mt-4">Date *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1 w-full border-gray-200 rounded-4xl p-2"
              required
            />

            <Label htmlFor="time" className="mt-4">Time *</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="mt-1 w-full border-gray-200 rounded-4xl p-2"
              required
            />

            <Label htmlFor="location" className="mt-4">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Event location"
              className="mt-1 w-full border-gray-200 rounded-4xl p-2"
              required
            />
          </div>

          {/* Right Column */}
          <div>
            <Label htmlFor="category">Status</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="mt-1 w-full rounded-4xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Label htmlFor="organizer" className="mt-4">Organizer</Label>
            <Input
              id="organizer"
              value={formData.organizer}
              onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
              placeholder="Organizer name"
              className="mt-1 w-full border-gray-200 rounded-4xl p-2"
            />

            <Label htmlFor="image" className="mt-4">Upload Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="mt-1 w-full rounded-4xl p-2"
            />
            {imageFile && (
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="mt-2 w-full h-40 object-cover rounded-2xl border border-gray-200"
              />
            )}


            <Label htmlFor="tags" className="mt-4">Tags</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
                className="flex-1 border-gray-200 rounded-4xl p-2"
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="md:col-span-2 flex gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-[#003893] border-[#003893] rounded-4xl hover:bg-[#003893] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="flex-1 text-[#003893] border-[#003893] rounded-4xl hover:bg-[#003893] hover:text-white"
            >
              {editEvent ? 'Update Event' : 'Create Event'}
            </Button>

          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
