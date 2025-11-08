import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { User, Session } from "@supabase/supabase-js";

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Executive form state
  const [execName, setExecName] = useState("");
  const [execPosition, setExecPosition] = useState("");
  const [execRole, setExecRole] = useState("");
  const [execYear, setExecYear] = useState(new Date().getFullYear());
  const [execRank, setExecRank] = useState(0);
  const [execPhoto, setExecPhoto] = useState("");
  const [uploading, setUploading] = useState(false);

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventMediaLink, setEventMediaLink] = useState("");
  const [eventImageUrl, setEventImageUrl] = useState("");
  const [uploadingEventImage, setUploadingEventImage] = useState(false);

  // Cultural image form state
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [uploadingCulturalImage, setUploadingCulturalImage] = useState(false);
  const [culturalImages, setCulturalImages] = useState<Array<{ id: string; image_url: string; caption: string }>>([]);

  // Home content form state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [missionText, setMissionText] = useState("");
  const [visionText, setVisionText] = useState("");
  const [slogan, setSlogan] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [chairpersonEmail, setChairpersonEmail] = useState("");
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [homeContentId, setHomeContentId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchHomeContent();
      fetchCulturalImages();
    }
  }, [isAdmin]);

  const fetchHomeContent = async () => {
    const { data, error } = await supabase
      .from("home_content")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching home content:", error);
    } else if (data) {
      setHeroTitle(data.hero_title);
      setHeroSubtitle(data.hero_subtitle);
      setMissionText(data.mission_text);
      setVisionText(data.vision_text);
      setSlogan(data.slogan);
      setHeroImageUrl(data.hero_image_url || "");
      setChairpersonEmail(data.chairperson_email || "");
      setHomeContentId(data.id);
    }
  };

  const checkAuth = async () => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        setTimeout(() => {
          checkAdminStatus(currentSession.user.id);
        }, 0);
      } else {
        setLoading(false);
        navigate("/auth");
      }
    });

    // THEN check for existing session
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    
    if (currentSession?.user) {
      await checkAdminStatus(currentSession.user.id);
    } else {
      setLoading(false);
      navigate("/auth");
    }

    return () => subscription.unsubscribe();
  };

  const checkAdminStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error checking admin status:", error);
      toast.error("Error verifying admin access");
      setLoading(false);
      return;
    }

    if (!data) {
      toast.error("You don't have admin access. Please contact an administrator.");
      navigate("/");
    } else {
      setIsAdmin(true);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError, data } = await supabase.storage
        .from('executive-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('executive-photos')
        .getPublicUrl(filePath);

      setExecPhoto(publicUrl);
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleAddExecutive = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("executives").insert({
      name: execName,
      position: execPosition,
      role: execRole,
      year: execYear,
      rank: execRank,
      photo_url: execPhoto || null,
    });

    if (error) {
      toast.error("Failed to add executive");
      console.error(error);
    } else {
      toast.success("Executive added successfully");
      setExecName("");
      setExecPosition("");
      setExecRole("");
      setExecRank(0);
      setExecPhoto("");
    }
  };

  const handleEventImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error("Please upload an image or video file");
      return;
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(isVideo ? "Video size should be less than 50MB" : "Image size should be less than 5MB");
      return;
    }

    setUploadingEventImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      setEventImageUrl(publicUrl);
      toast.success(isVideo ? "Event video uploaded successfully" : "Event image uploaded successfully");
    } catch (error) {
      console.error('Error uploading event image:', error);
      toast.error("Failed to upload event image");
    } finally {
      setUploadingEventImage(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("events").insert({
      title: eventTitle,
      description: eventDescription,
      event_date: eventDate || null,
      media_link: eventMediaLink || null,
      image_url: eventImageUrl || null,
    });

    if (error) {
      toast.error("Failed to add event");
      console.error(error);
    } else {
      toast.success("Event added successfully");
      setEventTitle("");
      setEventDescription("");
      setEventDate("");
      setEventMediaLink("");
      setEventImageUrl("");
    }
  };

  const handleCulturalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingCulturalImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('cultural-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cultural-images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      toast.success("Cultural image uploaded successfully");
    } catch (error) {
      console.error('Error uploading cultural image:', error);
      toast.error("Failed to upload cultural image");
    } finally {
      setUploadingCulturalImage(false);
    }
  };

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

  const handleAddCulturalImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("cultural_images").insert({
      image_url: imageUrl,
      caption: imageCaption,
    });

    if (error) {
      toast.error("Failed to add cultural image");
      console.error(error);
    } else {
      toast.success("Cultural image added successfully");
      setImageUrl("");
      setImageCaption("");
      fetchCulturalImages();
    }
  };

  const handleDeleteCulturalImage = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/cultural-images/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('cultural-images')
          .remove([filePath]);

        if (storageError) {
          console.error("Error deleting from storage:", storageError);
        }
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from("cultural_images")
        .delete()
        .eq("id", id);

      if (dbError) {
        toast.error("Failed to delete image");
        console.error(dbError);
      } else {
        toast.success("Image deleted successfully");
        fetchCulturalImages();
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploadingHeroImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('cultural-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cultural-images')
        .getPublicUrl(filePath);

      setHeroImageUrl(publicUrl);
      toast.success("Hero image uploaded successfully");
    } catch (error) {
      console.error('Error uploading hero image:', error);
      toast.error("Failed to upload hero image");
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleUpdateHomeContent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!homeContentId) {
      toast.error("Home content not found");
      return;
    }

    const { error } = await supabase
      .from("home_content")
      .update({
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        mission_text: missionText,
        vision_text: visionText,
        slogan: slogan,
        hero_image_url: heroImageUrl || null,
        chairperson_email: chairpersonEmail || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", homeContentId);

    if (error) {
      toast.error("Failed to update home content");
      console.error(error);
    } else {
      toast.success("Home content updated successfully");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-earth flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-earth">
      <Navbar />
      
      <section className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="executives" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="executives">Executives</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="home">Home Page</TabsTrigger>
          </TabsList>

          <TabsContent value="executives">
            <Card>
              <CardHeader>
                <CardTitle>Add New Executive</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddExecutive} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="exec-name">Name</Label>
                    <Input
                      id="exec-name"
                      value={execName}
                      onChange={(e) => setExecName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exec-position">Position</Label>
                    <Input
                      id="exec-position"
                      placeholder="e.g., President, Vice President"
                      value={execPosition}
                      onChange={(e) => setExecPosition(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exec-role">Role</Label>
                    <Input
                      id="exec-role"
                      placeholder="Brief description of responsibilities"
                      value={execRole}
                      onChange={(e) => setExecRole(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exec-year">Year</Label>
                    <Input
                      id="exec-year"
                      type="number"
                      value={execYear}
                      onChange={(e) => setExecYear(parseInt(e.target.value))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exec-rank">Rank (for ordering, lower numbers appear first)</Label>
                    <Input
                      id="exec-rank"
                      type="number"
                      placeholder="0"
                      value={execRank}
                      onChange={(e) => setExecRank(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower ranks appear first (e.g., 1=President, 2=Vice President, etc.)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exec-photo">Executive Photo</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('exec-photo')?.click()}
                          disabled={uploading}
                          className="w-full"
                        >
                          {uploading ? "Uploading..." : "Choose Photo from Device"}
                        </Button>
                      </div>
                      <Input
                        id="exec-photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Supported: JPG, PNG, WEBP • Max size: 5MB • Recommended: 400x400px or larger
                      </p>
                      {execPhoto && (
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                          <img src={execPhoto} alt="Preview" className="w-16 h-16 object-cover rounded-lg border-2 border-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Photo uploaded successfully</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setExecPhoto("")}
                              className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploading}>
                    Add Executive
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle>Add New Event</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-date">Event Date (optional)</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-media">Google Photos/Drive Link (optional)</Label>
                    <Input
                      id="event-media"
                      placeholder="https://photos.google.com/... or https://drive.google.com/..."
                      value={eventMediaLink}
                      onChange={(e) => setEventMediaLink(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event-image">Event Image/Video (optional)</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('event-image')?.click()}
                          disabled={uploadingEventImage}
                          className="w-full"
                        >
                          {uploadingEventImage ? "Uploading..." : "Choose Image/Video from Device"}
                        </Button>
                      </div>
                      <Input
                        id="event-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                        onChange={handleEventImageUpload}
                        disabled={uploadingEventImage}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Images: JPG, PNG, WEBP (Max 5MB) • Videos: MP4, WEBM, MOV (Max 50MB)
                      </p>
                      {eventImageUrl && (
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                          {eventImageUrl.includes('.mp4') || eventImageUrl.includes('.webm') || eventImageUrl.includes('.mov') ? (
                            <video src={eventImageUrl} className="w-16 h-16 object-cover rounded-lg border-2 border-primary" />
                          ) : (
                            <img src={eventImageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border-2 border-primary" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">Media uploaded successfully</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setEventImageUrl("")}
                              className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={uploadingEventImage}>
                    Add Event
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Cultural Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCulturalImage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cultural-image">Cultural Image</Label>
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('cultural-image')?.click()}
                            disabled={uploadingCulturalImage}
                            className="w-full"
                          >
                            {uploadingCulturalImage ? "Uploading..." : "Choose Image from Device"}
                          </Button>
                        </div>
                        <Input
                          id="cultural-image"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleCulturalImageUpload}
                          disabled={uploadingCulturalImage}
                          className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported: JPG, PNG, WEBP • Max size: 5MB
                        </p>
                        {imageUrl && (
                          <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                            <img src={imageUrl} alt="Preview" className="w-16 h-16 object-cover rounded-lg border-2 border-primary" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Image uploaded successfully</p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setImageUrl("")}
                                className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image-caption">Caption</Label>
                      <Input
                        id="image-caption"
                        placeholder="Brief description of the image"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={uploadingCulturalImage || !imageUrl}>
                      Add Image
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manage Cultural Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {culturalImages.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {culturalImages.map((image) => (
                        <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                          <img 
                            src={image.image_url} 
                            alt={image.caption}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3 bg-background/95">
                            <p className="text-sm font-medium mb-2">{image.caption}</p>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCulturalImage(image.id, image.image_url)}
                              className="w-full"
                            >
                              Delete Image
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No cultural images added yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="home">
            <Card>
              <CardHeader>
                <CardTitle>Edit Home Page Content</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateHomeContent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero-image">Hero Background Image</Label>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('hero-image')?.click()}
                          disabled={uploadingHeroImage}
                          className="w-full"
                        >
                          {uploadingHeroImage ? "Uploading..." : "Choose Hero Image from Device"}
                        </Button>
                      </div>
                      <Input
                        id="hero-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleHeroImageUpload}
                        disabled={uploadingHeroImage}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground">
                        Recommended: 1920x1080px or larger • Max size: 5MB
                      </p>
                      {heroImageUrl && (
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                          <img src={heroImageUrl} alt="Hero preview" className="w-24 h-16 object-cover rounded-lg border-2 border-primary" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Hero image uploaded</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setHeroImageUrl("")}
                              className="h-auto p-0 text-xs text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-title">Hero Title</Label>
                    <Input
                      id="hero-title"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                    <Input
                      id="hero-subtitle"
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mission-text">Mission Text</Label>
                    <Textarea
                      id="mission-text"
                      value={missionText}
                      onChange={(e) => setMissionText(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vision-text">Vision Text</Label>
                    <Textarea
                      id="vision-text"
                      value={visionText}
                      onChange={(e) => setVisionText(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan</Label>
                    <Input
                      id="slogan"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chairperson-email">Chairperson Email</Label>
                    <Input
                      id="chairperson-email"
                      type="email"
                      value={chairpersonEmail}
                      onChange={(e) => setChairpersonEmail(e.target.value)}
                      placeholder="chairperson@example.com"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Update Home Content
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default Admin;
