import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  initialFullName: string;
  initialGroupName: string;
  initialAvatarUrl: string;
  onSaved: () => void;
  lang: "ru" | "kz";
}

const ProfileEditDialog = ({
  open,
  onOpenChange,
  userId,
  initialFullName,
  initialGroupName,
  initialAvatarUrl,
  onSaved,
  lang,
}: Props) => {
  const isKz = lang === "kz";
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(initialFullName);
  const [groupName, setGroupName] = useState(initialGroupName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Re-initialize when dialog opens
  useEffect(() => {
    if (open) {
      setFullName(initialFullName);
      setGroupName(initialGroupName);
      setAvatarUrl(initialAvatarUrl);
    }
  }, [open, initialFullName, initialGroupName, initialAvatarUrl]);

  const initials = fullName
    ? fullName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });
    if (error) {
      toast({
        title: isKz ? "Жүктеу қатесі" : "Ошибка загрузки",
        description: error.message,
        variant: "destructive",
      });
    } else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
      toast({ title: isKz ? "Аватар жүктелді" : "Аватар загружен" });
    }
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        group_name: groupName.trim(),
        avatar_url: avatarUrl,
      })
      .eq("user_id", userId);
    if (error) {
      toast({
        title: isKz ? "Сақтау қатесі" : "Ошибка сохранения",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: isKz ? "Сақталды" : "Сохранено" });
      onSaved();
      onOpenChange(false);
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isKz ? "Профильді өзгерту" : "Редактировать профиль"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar className="h-24 w-24 border-2 border-primary/30">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="Avatar" /> : null}
                <AvatarFallback className="bg-secondary text-secondary-foreground text-xl font-display">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="h-6 w-6 text-foreground" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={uploading}
            />
            <span className="text-xs text-muted-foreground">
              {uploading
                ? isKz
                  ? "Жүктелуде..."
                  : "Загрузка..."
                : isKz
                  ? "Фото жүктеу үшін басыңыз"
                  : "Нажмите, чтобы загрузить фото"}
            </span>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="editFullName">
              {isKz ? "Толық аты" : "Полное имя"}
            </Label>
            <Input
              id="editFullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={isKz ? "Аты-жөніңізді енгізіңіз" : "Введите ваше имя"}
            />
          </div>

          {/* Group */}
          <div className="space-y-2">
            <Label htmlFor="editGroupName">
              {isKz ? "Тобы" : "Группа"}
            </Label>
            <Input
              id="editGroupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={isKz ? "Мысалы: ИС-21-1" : "Например: ИС-21-1"}
            />
          </div>

          {/* Save */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {saving
              ? isKz
                ? "Сақталуда..."
                : "Сохранение..."
              : isKz
                ? "Сақтау"
                : "Сохранить"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
