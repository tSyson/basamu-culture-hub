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

interface HomeContent {
  hero_title: string;
  hero_subtitle: string;
  mission_text: string;
  vision_text: string;
  slogan: string;
}

const Home = () => {
  const [culturalImages, setCulturalImages] = useState<CulturalImage[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent>({
    hero_title: "Welcome to BASAMU",
    hero_subtitle: "Banyakitara Students Association at Muni University.",
    mission_text: "BASAMU is dedicated to promoting cultural and community awareness, social justice, equity, unity through positive attitude towards development of the community and the nation at large.",
    vision_text: "To be model students in all walks of life Within the university and the community and the Nation in Target.",
    slogan: "Banyakitara tubebamwe"
  });

  useEffect(() => {
    fetchCulturalImages();
    fetchHomeContent();
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

  const fetchHomeContent = async () => {
    const { data, error } = await supabase
      .from("home_content")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching home content:", error);
    } else if (data) {
      setHomeContent({
        hero_title: data.hero_title,
        hero_subtitle: data.hero_subtitle,
        mission_text: data.mission_text,
        vision_text: data.vision_text,
        slogan: data.slogan
      });
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
              {homeContent.hero_title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl animate-fade-in">
              {homeContent.hero_subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6 animate-scale-in">
          <h2 className="text-4xl font-bold">Our Mission</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {homeContent.mission_text}
          </p>
          <h3 className="text-4xl font-bold">Our Vision</h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {homeContent.vision_text}
          </p>
          <h4 className="text-4xl font-bold">Slogan</h4>
          <p className="text-lg text-muted-foreground leading-relaxed">"{homeContent.slogan}"</p>
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
