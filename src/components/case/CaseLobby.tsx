import { Play, Crown, Clock, Shield, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleAssignment from "@/components/simulator/RoleAssignment";
import type { Participant, SimPhase, ConflictEvent, SimRole, SimulationSession } from "@/data/simulationData";

interface CaseLobbyProps {
  session: SimulationSession | null;
  participants: Participant[];
  phases: SimPhase[];
  conflicts: ConflictEvent[];
  currentUserId: string;
  isCreator: boolean;
  isKz: boolean;
  lang: "ru" | "kz";
  onCreateSession: () => void;
  onAssignRole: (userId: string, role: SimRole) => void;
  onStartSimulation: () => void;
}

const CaseLobby = ({
  session,
  participants,
  phases,
  conflicts,
  currentUserId,
  isCreator,
  isKz,
  lang,
  onCreateSession,
  onAssignRole,
  onStartSimulation,
}: CaseLobbyProps) => {
  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Play size={32} className="text-primary" />
          </div>
          <h2 className="font-display text-2xl font-bold">
            {isKz ? "Командалық симуляция" : "Командная симуляция"}
          </h2>
          <p className="text-muted-foreground">
            {isKz
              ? "Кезеңдік симуляцияны бастаңыз: рөлдер таңдау → тапсырмаларды орындау → қақтығыстарды шешу → нәтижелерді бағалау"
              : "Начните пошаговую симуляцию: выбор ролей → выполнение задач → разрешение конфликтов → оценка результатов"}
          </p>
          <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
              <Crown size={14} className="text-yellow-500" />
              {isKz ? "Рөлдер бөлу" : "Распределение ролей"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
              <Clock size={14} className="text-blue-500" />
              {phases.length} {isKz ? "кезең" : "этапов"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
              <Shield size={14} className="text-red-500" />
              {conflicts.length} {isKz ? "қақтығыс" : "конфликтов"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary">
              <Award size={14} className="text-green-500" />
              360° {isKz ? "бағалау" : "оценка"}
            </span>
          </div>
          <Button size="lg" className="gap-2" onClick={onCreateSession}>
            <Play size={18} />
            {isKz ? "Сессия құру" : "Создать сессию"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <RoleAssignment
        participants={participants}
        currentUserId={currentUserId}
        lang={lang}
        onAssignRole={onAssignRole}
        onStart={onStartSimulation}
        isCreator={isCreator}
      />
    </div>
  );
};

export default CaseLobby;
