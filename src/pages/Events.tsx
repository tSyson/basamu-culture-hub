import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink } from "lucide-react";
import { format } from "date-fns";

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

  useEffect(() => {
    fetchEvents();
  }, []);

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

        {/* Events Grid */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
            {events.map((event) => (
              <Card key={event.id} className="overflow-hidden animate-scale-in hover:shadow-lg transition-shadow">
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
                      className="text-primary hover:underline break-all text-xs md:text-sm inline-block"
                    >
                      {event.media_link}
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No events have been added yet. Check back soon!</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Events;
