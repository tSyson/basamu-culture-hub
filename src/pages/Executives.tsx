import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Executive {
  id: string;
  name: string;
  position: string;
  role: string;
  year: number;
  photo_url: string | null;
}

const Executives = () => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    fetchExecutives();
  }, []);

  const fetchExecutives = async () => {
    const { data, error } = await supabase
      .from("executives")
      .select("*")
      .order("rank", { ascending: true })
      .order("year", { ascending: false });

    if (error) {
      console.error("Error fetching executives:", error);
    } else {
      setExecutives(data || []);
      const uniqueYears = Array.from(new Set(data?.map(e => e.year) || []));
      setYears(uniqueYears.sort((a, b) => b - a));
    }
  };

  const filteredExecutives = selectedYear === "all" 
    ? executives 
    : executives.filter(exec => exec.year.toString() === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-earth">
      <Navbar />
      
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">Our Leadership</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Meet the dedicated team members who guide BASAMU's mission and initiatives
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex justify-center mb-12">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[200px] bg-card">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Executives Grid */}
        {filteredExecutives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExecutives.map((exec) => (
              <Card key={exec.id} className="overflow-hidden animate-scale-in hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="w-24 h-24 border-4 border-primary">
                      <AvatarImage src={exec.photo_url || undefined} alt={exec.name} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {exec.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{exec.name}</h3>
                      <p className="text-primary font-medium">{exec.position}</p>
                      <p className="text-muted-foreground text-sm mt-2">{exec.role}</p>
                      <p className="text-accent font-semibold text-sm mt-2">{exec.year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No executives found for the selected year.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Executives;
