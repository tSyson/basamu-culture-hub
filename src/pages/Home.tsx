import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-cultural.jpg";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";

interface CulturalImage {
  id: string;
  image_url: string;
  caption: string;
}

const Home = () => {
  const [culturalImages, setCulturalImages] = useState<CulturalImage[]>([]);

  useEffect(() => {
    fetchCulturalImages();
  }, []);

  const fetchCulturalImages = async () => {
    const { data, error } = await supabase
      .from("cultural_images")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching cultural images:", error);
    } else {
      setCulturalImages(data || []);
    }
  };

  const defaultGallery = [
    { image: gallery1, caption: "Traditional celebration with vibrant cultural attire" },
    { image: gallery2, caption: "Handcrafted baskets and pottery showcasing our artisan heritage" },
    { image: gallery3, caption: "Western Uganda landscape at golden hour" },
  ];

  return (
    <div className="min-h-screen bg-gradient-earth">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Western Uganda cultural heritage" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent flex items-end">
          <div className="container mx-auto px-4 pb-20">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 animate-fade-in">
              Welcome to BASAMU
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl animate-fade-in">
              Banyankore Students Association at Muni University.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-scale-in">
          <h2 className="text-4xl font-bold">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            BASAMU is dedicated to celebrating, preserving, and promoting the rich cultural heritage of Western Uganda. 
            We bring together students at Makerere University to foster unity, showcase our traditions, and create lasting 
            bonds through cultural events, educational initiatives, and community engagement.
          </p>
        </div>
      </section>

      {/* Cultural Gallery */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Cultural Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {culturalImages.length > 0 ? (
            culturalImages.map((item) => (
              <div 
                key={item.id} 
                className="group relative overflow-hidden rounded-lg aspect-square animate-fade-in hover:scale-105 transition-transform duration-300"
              >
                <img 
                  src={item.image_url} 
                  alt={item.caption} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-foreground font-medium">{item.caption}</p>
                </div>
              </div>
            ))
          ) : (
            defaultGallery.map((item, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-lg aspect-square animate-fade-in hover:scale-105 transition-transform duration-300"
              >
                <img 
                  src={item.image} 
                  alt={item.caption} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <p className="text-foreground font-medium">{item.caption}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
