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
  const [execPhoto, setExecPhoto] = useState("");
  const [uploading, setUploading] = useState(false);

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventMediaLink, setEventMediaLink] = useState("");

  // Cultural image form state
  const [imageUrl, setImageUrl] = useState("");
  const [imageCaption, setImageCaption] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

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
      setExecPhoto("");
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from("events").insert({
      title: eventTitle,
      description: eventDescription,
      event_date: eventDate || null,
      media_link: eventMediaLink || null,
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
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>

        <Tabs defaultValue="executives" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl">
            <TabsTrigger value="executives">Executives</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
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
                    <Label htmlFor="event-media">Google Drive/YouTube Link (optional)</Label>
                    <Input
                      id="event-media"
                      placeholder="https://drive.google.com/... or https://youtube.com/..."
                      value={eventMediaLink}
                      onChange={(e) => setEventMediaLink(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Event
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Add Cultural Image</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddCulturalImage} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      required
                    />
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
                  <Button type="submit" className="w-full">
                    Add Image
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
