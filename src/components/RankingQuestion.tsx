import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";

interface RankingItem {
  label: string;
  score: number;
}

interface RankingQuestionProps {
  items: RankingItem[];
  idealOrder: number[];
  onScore: (score: number) => void;
  currentScore?: number;
}

/**
 * Ranking question component.
 * User reorders items using up/down buttons.
 * Score is computed based on how close the user's order is to the ideal order (1–4).
 */
const RankingQuestion = ({ items, idealOrder, onScore, currentScore }: RankingQuestionProps) => {
  const [order, setOrder] = useState<number[]>(() => {
    // Start with a shuffled order (reversed to make it non-trivial)
    const indices = items.map((_, i) => i);
    return indices.reverse();
  });

  // Compute score whenever order changes
  useEffect(() => {
    const score = computeRankingScore(order, idealOrder);
    onScore(score);
  }, [order]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setOrder(newOrder);
  };

  return (
    <div className="space-y-2">
      {order.map((itemIndex, position) => (
        <div
          key={itemIndex}
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/30"
        >
          <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
            {position + 1}
          </span>
          <span className="flex-1 text-sm text-foreground">{items[itemIndex].label}</span>
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => moveUp(position)}
              disabled={position === 0}
            >
              <ArrowUp size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => moveDown(position)}
              disabled={position === order.length - 1}
            >
              <ArrowDown size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Compute a score 1–4 based on how many items are in the correct position.
 * 4 = all correct, 3 = 3 correct, 2 = 2 correct, 1 = 0–1 correct.
 */
export function computeRankingScore(userOrder: number[], idealOrder: number[]): number {
  let correctPositions = 0;
  for (let i = 0; i < userOrder.length; i++) {
    if (userOrder[i] === idealOrder[i]) {
      correctPositions++;
    }
  }
  if (correctPositions >= 4) return 4;
  if (correctPositions === 3) return 3;
  if (correctPositions === 2) return 2;
  return 1;
}

export default RankingQuestion;
