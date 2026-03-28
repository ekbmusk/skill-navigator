import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, BarChart3, Palette, Mic, Check, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrbitalIcon, HexIcon, BlobIcon, DiamondIcon } from "@/components/BrandIcons";
import { ROLE_DEFINITIONS, type SimRole, type Participant } from "@/data/simulationData";

const ROLE_ICONS: Record<SimRole, React.ReactNode> = {
  leader: (
    <OrbitalIcon size={48} gradient="from-amber-500 to-orange-500">
      <Crown size={22} className="text-white" />
    </OrbitalIcon>
  ),
  analyst: (
    <HexIcon size={48} gradient="from-blue-500 to-cyan-500" animate={false}>
      <BarChart3 size={22} className="text-white" />
    </HexIcon>
  ),
  creative: (
    <BlobIcon size={48} gradient="from-violet-500 to-purple-500">
      <Palette size={22} className="text-white" />
    </BlobIcon>
  ),
  presenter: (
    <DiamondIcon size={48} gradient="from-emerald-500 to-teal-500">
      <Mic size={22} className="text-white" />
    </DiamondIcon>
  ),
};

interface RoleAssignmentProps {
  participants: Participant[];
  currentUserId: string;
  lang: "ru" | "kz";
  onAssignRole: (userId: string, role: SimRole) => Promise<void>;
  onStart: () => void;
  isCreator: boolean;
}

const RoleAssignment = ({
  participants,
  currentUserId,
  lang,
  onAssignRole,
  onStart,
  isCreator,
}: RoleAssignmentProps) => {
  const [assigning, setAssigning] = useState(false);
  const isKz = lang === "kz";

  const allRolesAssigned =
    participants.length >= 1 &&
    participants.every((p) => p.role !== "member");

  const takenRoles = new Set(
    participants.filter((p) => p.role !== "member").map((p) => p.role)
  );

  const handleAssign = async (userId: string, role: SimRole) => {
    setAssigning(true);
    await onAssignRole(userId, role);
    setAssigning(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Users2 size={16} />
          {participants.length} / 4 {isKz ? "қатысушы" : "участников"}
        </div>
        <h2 className="font-display text-2xl font-bold">
          {isKz ? "Рөлдерді таңдаңыз" : "Выберите роли"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isKz
            ? "Әр қатысушы өзіне рөл таңдасын"
            : "Каждый участник выбирает свою роль в команде"}
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {(Object.entries(ROLE_DEFINITIONS) as [SimRole, typeof ROLE_DEFINITIONS[SimRole]][]).map(
          ([roleKey, def], i) => {
            const assignedTo = participants.find((p) => p.role === roleKey);
            const isTaken = !!assignedTo;
            const isMe = assignedTo?.user_id === currentUserId;
            const myCurrentRole = participants.find(
              (p) => p.user_id === currentUserId
            )?.role;

            return (
              <motion.div
                key={roleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-5 rounded-xl border transition-all duration-300 ${
                  isMe
                    ? "border-primary bg-primary/5 shadow-glow"
                    : isTaken
                    ? "border-border/50 bg-card/30 opacity-60"
                    : "border-border bg-card-gradient hover:border-primary/40 hover:shadow-card cursor-pointer"
                }`}
              >
                {isMe && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check size={14} className="text-primary-foreground" />
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {ROLE_ICONS[roleKey]}

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-base">
                      {isKz ? def.labelKz : def.label}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {isKz ? def.descriptionKz : def.description}
                    </p>

                    <div className="mt-3 space-y-1">
                      {(isKz ? def.responsibilitiesKz : def.responsibilities).map(
                        (r, j) => (
                          <div
                            key={j}
                            className="text-xs text-muted-foreground flex items-center gap-1.5"
                          >
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            {r}
                          </div>
                        )
                      )}
                    </div>

                    {isTaken ? (
                      <div className="mt-3 text-sm font-medium">
                        {isMe
                          ? isKz
                            ? "Сіздің рөліңіз"
                            : "Ваша роль"
                          : assignedTo.full_name}
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 gap-1.5"
                        disabled={
                          assigning ||
                          (myCurrentRole !== "member" && myCurrentRole !== undefined)
                        }
                        onClick={() => handleAssign(currentUserId, roleKey)}
                      >
                        {isKz ? "Таңдау" : "Выбрать"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          }
        )}
      </div>

      {/* Participants List */}
      <div className="rounded-xl border border-border bg-card/50 p-5">
        <h3 className="font-display font-semibold mb-3">
          {isKz ? "Қатысушылар" : "Участники"}
        </h3>
        <div className="space-y-2">
          {participants.map((p) => (
            <div
              key={p.user_id}
              className="flex items-center justify-between py-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                  {p.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium">{p.full_name}</span>
                {p.user_id === currentUserId && (
                  <span className="text-xs text-muted-foreground">
                    ({isKz ? "сіз" : "вы"})
                  </span>
                )}
              </div>
              {p.role !== "member" ? (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    ROLE_DEFINITIONS[p.role as SimRole]?.color || ""
                  } bg-current/10`}
                  style={{
                    backgroundColor: `color-mix(in srgb, currentColor 10%, transparent)`,
                  }}
                >
                  {isKz
                    ? ROLE_DEFINITIONS[p.role as SimRole]?.labelKz
                    : ROLE_DEFINITIONS[p.role as SimRole]?.label}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {isKz ? "Рөл таңдалмаған" : "Роль не выбрана"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Button */}
      {isCreator && (
        <div className="text-center">
          <Button
            size="lg"
            className="gap-2 px-8"
            disabled={!allRolesAssigned}
            onClick={onStart}
          >
            {isKz ? "Симуляцияны бастау" : "Начать симуляцию"}
          </Button>
          {!allRolesAssigned && (
            <p className="text-xs text-muted-foreground mt-2">
              {isKz
                ? "Барлық қатысушылар рөл таңдауы керек"
                : "Все участники должны выбрать роль"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RoleAssignment;
