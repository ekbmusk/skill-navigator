import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PeerFeedback from "@/components/simulator/PeerFeedback";
import type { Participant, PeerFeedbackData, FeedbackSummary } from "@/data/simulationData";

interface CaseResultsProps {
  participants: Participant[];
  currentUserId: string;
  lang: "ru" | "kz";
  isKz: boolean;
  feedbackSummaries: FeedbackSummary[] | null;
  onSubmitFeedback: (feedbacks: PeerFeedbackData[]) => void;
}

const CaseResults = ({
  participants,
  currentUserId,
  lang,
  isKz,
  feedbackSummaries,
  onSubmitFeedback,
}: CaseResultsProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PeerFeedback
        participants={participants}
        currentUserId={currentUserId}
        lang={lang}
        onSubmit={onSubmitFeedback}
        summaries={feedbackSummaries}
        submitted={true}
      />
      <div className="text-center mt-8">
        <Link to="/cases">
          <Button variant="outline" className="gap-2">
            <ChevronLeft size={16} />
            {isKz ? "Кейстерге оралу" : "Вернуться к кейсам"}
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CaseResults;
