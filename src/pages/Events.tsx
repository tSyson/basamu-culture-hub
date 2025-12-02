import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Calendar, ExternalLink, Search, SlidersHorizontal, Pencil } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string | null;
  media_link: string | null;
  image_url: string | null;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    event_date: "",
    media_link: ""
  });

  useEffect(() => {
    fetchEvents();
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAdmin(false);
      return;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!error && data) {
      setIsAdmin(true);
    }
  };

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      setEvents(data || []);
    }
  };

  const handleEditEvent = async () => {
    if (!editingEventId) return;

    const { error } = await supabase
      .from("events")
      .update({
        title: editForm.title,
        description: editForm.description,
        event_date: editForm.event_date,
        media_link: editForm.media_link
      })
      .eq("id", editingEventId);

    if (error) {
      toast.error("Failed to update event");
      console.error(error);
      return;
    }

    setEditingEventId(null);
    fetchEvents();
    toast.success("Event updated successfully!");
  };

  const openEditDialog = (event: Event) => {
    setEditingEventId(event.id);
    setEditForm({
      title: event.title,
      description: event.description,
      event_date: event.event_date || "",
      media_link: event.media_link || ""
    });
  };

  // Get unique years from events
  const availableYears = useMemo(() => {
    const years = events
      .map(event => event.event_date ? new Date(event.event_date).getFullYear() : null)
      .filter((year): year is number => year !== null);
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [events]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Year filter
    if (selectedYear !== "all") {
      filtered = filtered.filter(event => {
        if (!event.event_date) return false;
        return new Date(event.event_date).getFullYear() === parseInt(selectedYear);
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = a.event_date ? new Date(a.event_date).getTime() : 0;
      const dateB = b.event_date ? new Date(b.event_date).getTime() : 0;
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [events, searchTerm, selectedYear, sortOrder]);

  return (
    <div className="min-h-screen bg-gradient-earth">
      <Navbar />
      
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">Our Events</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Celebrating our culture through memorable gatherings, functions, and cultural celebrations
          </p>
        </div>

        {/* Filter Controls */}
        <div className="max-w-7xl mx-auto mb-8 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <SlidersHorizontal size={20} />
            <h2 className="text-lg font-semibold">Filter & Sort</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {availableYears.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Order */}
            <Select value={sortOrder} onValueChange={(value: "newest" | "oldest") => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden animate-scale-in hover:shadow-lg transition-shadow relative">
                {isAdmin && (
                  <Dialog open={editingEventId === event.id} onOpenChange={(open) => !open && setEditingEventId(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                        onClick={() => openEditDialog(event)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Title</Label>
                          <Input
                            id="title"
                            value={editForm.title}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            className="mt-2"
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label htmlFor="event_date">Event Date</Label>
                          <Input
                            id="event_date"
                            type="datetime-local"
                            value={editForm.event_date}
                            onChange={(e) => setEditForm({...editForm, event_date: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="media_link">Media Link</Label>
                          <Input
                            id="media_link"
                            value={editForm.media_link}
                            onChange={(e) => setEditForm({...editForm, media_link: e.target.value})}
                            className="mt-2"
                            placeholder="https://..."
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setEditingEventId(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleEditEvent}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {event.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-black">
                    {event.image_url.includes('.mp4') || event.image_url.includes('.webm') || event.image_url.includes('.mov') ? (
                      <video 
                        src={event.image_url} 
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img 
                        src={event.image_url} 
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                )}
                <CardHeader className="bg-gradient-sunset text-primary-foreground p-4 md:p-6">
                  <CardTitle className="text-xl md:text-2xl">{event.title}</CardTitle>
                  {event.event_date && (
                    <div className="flex items-center gap-2 text-primary-foreground/90">
                      <Calendar size={16} />
                      <span className="text-xs md:text-sm">
                        {format(new Date(event.event_date), "MMMM d, yyyy")}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{event.description}</p>
                  {event.media_link && (
                    <a
                      href={event.media_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        asChild
                      >
                        <span>
                          <ExternalLink size={16} />
                          View Photos
                        </span>
                      </Button>
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {events.length === 0 
                ? "No events have been added yet. Check back soon!" 
                : "No events match your filters. Try adjusting your search criteria."}
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Events;
