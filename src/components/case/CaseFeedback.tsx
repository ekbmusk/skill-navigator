import PeerFeedback from "@/components/simulator/PeerFeedback";
import type { Participant, PeerFeedbackData, FeedbackSummary } from "@/data/simulationData";

interface CaseFeedbackProps {
  participants: Participant[];
  currentUserId: string;
  lang: "ru" | "kz";
  feedbackSummaries: FeedbackSummary[] | null;
  feedbackSubmitted: boolean;
  onSubmitFeedback: (feedbacks: PeerFeedbackData[]) => void;
}

const CaseFeedback = ({
  participants,
  currentUserId,
  lang,
  feedbackSummaries,
  feedbackSubmitted,
  onSubmitFeedback,
}: CaseFeedbackProps) => {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <PeerFeedback
        participants={participants}
        currentUserId={currentUserId}
        lang={lang}
        onSubmit={onSubmitFeedback}
        summaries={feedbackSummaries}
        submitted={feedbackSubmitted}
      />
    </div>
  );
};

export default CaseFeedback;
