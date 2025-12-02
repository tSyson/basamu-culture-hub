import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Pencil, Edit } from "lucide-react";
import { toast } from "sonner";

interface Executive {
  id: string;
  name: string;
  position: string;
  role: string;
  year: string;
  photo_url: string | null;
  email: string | null;
}

const Executives = () => {
  const [executives, setExecutives] = useState<Executive[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [years, setYears] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingExecId, setEditingExecId] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState<string>("");
  const [editingEmailId, setEditingEmailId] = useState<string | null>(null);
  const [editingDetailsId, setEditingDetailsId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    position: "",
    role: "",
    year: ""
  });

  useEffect(() => {
    fetchExecutives();
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
      setYears(uniqueYears.sort((a, b) => b.localeCompare(a)));
    }
  };

  const handlePhotoUpload = async (execId: string, file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('executive-photos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('executive-photos')
        .getPublicUrl(filePath);

      // Update executive record with new photo
      const { error: updateError } = await supabase
        .from("executives")
        .update({ photo_url: publicUrl })
        .eq("id", execId);

      if (updateError) throw updateError;

      toast.success("Photo updated successfully");
      fetchExecutives();
      setEditingExecId(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const handleEmailUpdate = async (executiveId: string) => {
    if (!editingEmail) {
      toast.error("Please enter an email address");
      return;
    }

    const { error } = await supabase
      .from("executives")
      .update({ email: editingEmail })
      .eq("id", executiveId);

    if (error) {
      toast.error("Failed to update email");
      console.error(error);
      return;
    }

    setEditingEmailId(null);
    setEditingEmail("");
    fetchExecutives();
    toast.success("Email updated successfully!");
  };

  const handleDetailsUpdate = async () => {
    if (!editingDetailsId) return;

    const { error } = await supabase
      .from("executives")
      .update({
        name: editForm.name,
        position: editForm.position,
        role: editForm.role,
        year: editForm.year
      })
      .eq("id", editingDetailsId);

    if (error) {
      toast.error("Failed to update details");
      console.error(error);
      return;
    }

    setEditingDetailsId(null);
    fetchExecutives();
    toast.success("Details updated successfully!");
  };

  const openEditDialog = (exec: Executive) => {
    setEditingDetailsId(exec.id);
    setEditForm({
      name: exec.name,
      position: exec.position,
      role: exec.role,
      year: exec.year
    });
  };

  const filteredExecutives = selectedYear === "all"
    ? executives 
    : executives.filter(exec => exec.year.toString() === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-earth">
      <Navbar />
      
      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        <div className="text-center mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">Our Leadership</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Meet the dedicated team members who guide BASAMU's mission and initiatives
          </p>
        </div>

        {/* Year Filter */}
        <div className="flex justify-center mb-8 md:mb-12">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {filteredExecutives.map((exec) => (
              <Card key={exec.id} className="overflow-hidden animate-scale-in hover:shadow-lg transition-shadow relative">
                {isAdmin && (
                  <Dialog open={editingDetailsId === exec.id} onOpenChange={(open) => !open && setEditingDetailsId(null)}>
                    <DialogTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="secondary" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg z-10"
                        onClick={() => openEditDialog(exec)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Executive Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="position">Position</Label>
                          <Input
                            id="position"
                            value={editForm.position}
                            onChange={(e) => setEditForm({...editForm, position: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Textarea
                            id="role"
                            value={editForm.role}
                            onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                            className="mt-2"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="year">Year (e.g., 2025/2026)</Label>
                          <Input
                            id="year"
                            value={editForm.year}
                            onChange={(e) => setEditForm({...editForm, year: e.target.value})}
                            className="mt-2"
                            placeholder="2025/2026"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setEditingDetailsId(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleDetailsUpdate}>
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col items-center text-center space-y-3 md:space-y-4">
                    <div className="relative">
                      <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-primary">
                        <AvatarImage src={exec.photo_url || undefined} alt={exec.name} className="object-cover" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl md:text-2xl">
                          {exec.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      {isAdmin && (
                        <Dialog open={editingExecId === exec.id} onOpenChange={(open) => setEditingExecId(open ? exec.id : null)}>
                          <DialogTrigger asChild>
                            <Button 
                              size="icon" 
                              variant="secondary" 
                              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-lg"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Profile Picture</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor={`photo-${exec.id}`}>Upload New Photo</Label>
                                <Input
                                  id={`photo-${exec.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handlePhotoUpload(exec.id, file);
                                    }
                                  }}
                                  disabled={uploading}
                                  className="mt-2"
                                />
                              </div>
                              {uploading && (
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                  <Upload className="h-4 w-4 animate-pulse" />
                                  Uploading...
                                </p>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                    <div className="w-full">
                      <h3 className="text-lg md:text-xl font-bold">{exec.name}</h3>
                      <p className="text-primary font-medium text-sm md:text-base">{exec.position}</p>
                      <p className="text-muted-foreground text-xs md:text-sm mt-1 md:mt-2">{exec.role}</p>
                      <p className="text-accent font-semibold text-xs md:text-sm mt-1 md:mt-2">{exec.year}</p>
                      
                      {isAdmin ? (
                        <div className="mt-3 space-y-2">
                          {editingEmailId === exec.id ? (
                            <div className="flex gap-2">
                              <Input
                                type="email"
                                value={editingEmail}
                                onChange={(e) => setEditingEmail(e.target.value)}
                                placeholder="email@example.com"
                                className="text-xs h-8"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleEmailUpdate(exec.id)}
                                className="text-xs h-8"
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingEmailId(null);
                                  setEditingEmail("");
                                }}
                                className="text-xs h-8"
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              {exec.email ? (
                                <p className="text-xs text-muted-foreground truncate">{exec.email}</p>
                              ) : (
                                <p className="text-xs text-muted-foreground italic">No email set</p>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingEmailId(exec.id);
                                  setEditingEmail(exec.email || "");
                                }}
                                className="h-6 px-2 text-xs"
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : exec.email ? (
                        <p className="text-xs text-muted-foreground mt-2">{exec.email}</p>
                      ) : null}
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
