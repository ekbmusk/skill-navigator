import { useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/i18n/LanguageContext";

const ProfilePage = () => {
  const { user, profile, role } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLang();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [groupName, setGroupName] = useState(profile?.group_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) {
      toast({ title: t.profile.uploadError, description: error.message, variant: "destructive" });
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
      toast({ title: t.profile.avatarUploaded });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName.trim(), group_name: groupName.trim(), avatar_url: avatarUrl }).eq("user_id", user.id);
    if (error) {
      toast({ title: t.profile.saveError, description: error.message, variant: "destructive" });
    } else {
      toast({ title: t.profile.saved });
    }
    setSaving(false);
  };

  const initials = fullName ? fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-lg pt-24 pb-12">
        <Card className="border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl text-foreground">{t.profile.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-24 w-24 border-2 border-primary/30">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="Avatar" /> : null}
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-display">{initials}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="h-6 w-6 text-foreground" />
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
              <span className="text-xs text-muted-foreground">{uploading ? t.profile.avatarUploading : t.profile.avatarHint}</span>
            </div>

            <div className="flex justify-center">
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs uppercase tracking-wider font-medium">
                {role === "teacher" ? t.nav.teacher : t.nav.student}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">{t.auth.email}</Label>
                <Input id="email" value={user?.email || ""} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">{t.profile.fullName}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t.profile.fullNamePlaceholder} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupName">{t.profile.group}</Label>
                <Input id="groupName" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder={t.profile.groupPlaceholder} />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? t.profile.saving : t.profile.save}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
