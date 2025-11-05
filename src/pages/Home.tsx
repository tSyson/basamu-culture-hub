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
  hero_image_url?: string;
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
        slogan: data.slogan,
        hero_image_url: data.hero_image_url
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
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="relative w-full h-full">
          <img 
            src={homeContent.hero_image_url || heroImage} 
            alt="Western Uganda cultural heritage" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 md:mb-4 animate-fade-in drop-shadow-lg">
                {homeContent.hero_title}
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto animate-fade-in drop-shadow-md">
                {homeContent.hero_subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6 animate-scale-in">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">Our Mission</h2>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-4">
            {homeContent.mission_text}
          </p>
          <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold pt-4 md:pt-6">Our Vision</h3>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-4">
            {homeContent.vision_text}
          </p>
          <h4 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold pt-4 md:pt-6">Slogan</h4>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed px-4">"{homeContent.slogan}"</p>
        </div>
      </section>

      {/* Cultural Gallery */}
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-12">Cultural Gallery</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
