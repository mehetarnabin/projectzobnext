// EventPage.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, Sparkles } from 'lucide-react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import  EventCard  from '../components/EmployerDashboard/EventCard';
import { CreateEventModal } from '../components/EmployerDashboard/CreateEventModal';
import { ShareEventModal } from '../components/EmployerDashboard/ShareEventModal';
import { EventStats } from '../components/EmployerDashboard/EventStats';
import { useToast } from '../hooks/useToast';

const EventPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [shareEvent, setShareEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await import('../api/event').then(module => module.fetchEvents());
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  const handleSaveEvent = async (eventData) => {
    try {
      const { createEvent, updateEvent } = await import('../api/event');
      let data;
      if (editEvent && editEvent.id) {
        data = await updateEvent(editEvent.id, eventData);
        setEvents(prev => prev.map(e => (e.id === data.id ? data : e)));
        toast({ title: "Event Updated", description: `${data.title} updated successfully` });
      } else {
        data = await createEvent(eventData);
        setEvents(prev => [data, ...prev]);
        toast({ title: "Event Created", description: `${data.title} created successfully` });
      }
      setIsCreateModalOpen(false);
      setEditEvent(null);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  const handleEditEvent = (event) => {
    setEditEvent(event);
    setIsCreateModalOpen(true);
  };

  const handleDeleteEvent = async (id) => {
    try {
      const { deleteEvent } = await import('../api/event');
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast({ title: "Event Deleted", description: "Deleted successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleShareEvent = (event) => {
    setShareEvent(event);
    setIsShareModalOpen(true);
  };

  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "all" ? true : event.category === activeTab;
      return matchesSearch && matchesTab;
    })
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      if (sortBy === "date") return new Date(a.date) - new Date(b.date);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section (only button now) */}
      <div className="bg-[#003893] text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#DC143C] hover:bg-red-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Your Event
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-6 py-8">
        <EventStats events={events} />

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8 items-center">
          {/* Search bar */}
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:ring-2 focus:ring-[#003893] focus:border-[#003893]"
            />
          </div>

          {/* Sort + Button */}
          <div className="flex gap-3">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border border-gray-300 rounded-lg flex items-center gap-2 px-3 py-2 hover:border-[#003893] focus:border-[#003893] focus:ring-2 focus:ring-[#003893]">
                <Filter className="h-4 w-4 text-[#003893]" />
                <SelectValue className="text-[#003893]" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  value="date" 
                  className="hover:bg-[#003893] hover:text-white focus:bg-[#003893] focus:text-white"
                >
                  Sort by Date
                </SelectItem>
                <SelectItem 
                  value="title" 
                  className="hover:bg-[#003893] hover:text-white focus:bg-[#003893] focus:text-white"
                >
                  Sort by Title
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Updated Second Button with Plus icon */}
            
          </div>
        </div>

        {/* Event Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6 gap-2">
            <TabsTrigger
              value="all"
              className={`border rounded-lg px-3 py-2 transition ${
                activeTab === "all"
                  ? "bg-[#003893] text-white border-[#003893]"
                  : "bg-white border-gray-300 hover:border-[#003893] hover:text-[#003893]"
              }`}
            >
              <Calendar className="h-4 w-4 mr-1"/> All
            </TabsTrigger>

            <TabsTrigger
              value="upcoming"
              className={`border rounded-lg px-3 py-2 transition ${
                activeTab === "upcoming"
                  ? "bg-[#003893] text-white border-[#003893]"
                  : "bg-white border-gray-300 hover:border-[#003893] hover:text-[#003893]"
              }`}
            >
              <Sparkles className="h-4 w-4 mr-1"/> Upcoming
            </TabsTrigger>

            <TabsTrigger
              value="ongoing"
              className={`border rounded-lg px-3 py-2 transition ${
                activeTab === "ongoing"
                  ? "bg-[#003893] text-white border-[#003893]"
                  : "bg-white border-gray-300 hover:border-[#003893] hover:text-[#003893]"
              }`}
            >
              Ongoing
            </TabsTrigger>

            <TabsTrigger
              value="completed"
              className={`border rounded-lg px-3 py-2 transition ${
                activeTab === "completed"
                  ? "bg-[#003893] text-white border-[#003893]"
                  : "bg-white border-gray-300 hover:border-[#003893] hover:text-[#003893]"
              }`}
            >
              Completed
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredEvents.length === 0 ? (
              <p className="text-center text-muted-foreground">
                {activeTab === "all" ? "No events found." : `No ${activeTab} events found.`}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                    onShare={handleShareEvent}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditEvent(null); }}
        onSave={handleSaveEvent}
        editEvent={editEvent}
        className="max-h-[90vh] overflow-y-auto"
      />
      <ShareEventModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        event={shareEvent}
        className="max-h-[90vh] overflow-y-auto"
      />
    </div>
  );
};

export default EventPage;