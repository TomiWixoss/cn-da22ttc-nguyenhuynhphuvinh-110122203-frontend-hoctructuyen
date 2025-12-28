import React, { useMemo } from "react";
import { QuizParticipant } from "@/lib/types/quiz";
import { ScrollArea } from "@/components/ui/layout";
import { User } from "lucide-react";

export interface ParticipantEmoji {
  userId: number;
  emojiImagePath: string;
  emojiName: string;
}

interface ParticipantListProps {
  participants: QuizParticipant[];
  participantEmojis?: ParticipantEmoji[];
}

export const ParticipantList: React.FC<ParticipantListProps> = ({
  participants,
  participantEmojis = [],
}) => {
  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => a.name.localeCompare(b.name));
  }, [participants]);

  const getParticipantEmoji = (userId: number | string) => {
    // Convert to number for comparison
    const userIdNum =
      typeof userId === "string" ? parseInt(userId, 10) : userId;
    const emoji = participantEmojis.find((pe) => pe.userId === userIdNum);
    if (emoji) {
      console.log(`Found emoji for user ${userId}:`, emoji);
    }
    return emoji;
  };

  console.log("ParticipantList render:", {
    participants: participants.map((p) => p.user_id),
    participantEmojis,
  });

  return (
    <div className="w-full">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6">
        Danh sách học viên ({participants.length})
      </h2>

      {participants.length === 0 ? (
        <div className="text-center py-6 md:py-10 text-muted-foreground">
          Chưa có học viên nào tham gia
        </div>
      ) : (
        <ScrollArea className="w-full px-2">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center">
            {sortedParticipants.map((participant) => {
              const emoji = getParticipantEmoji(participant.user_id);
              return (
                <div
                  key={participant.user_id}
                  className="flex items-center p-2 md:p-3 rounded-lg border-2 border-primary/20 bg-background hover:bg-accent/5 hover:border-primary transition-all"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0 overflow-hidden">
                    {participant.avatar_url &&
                    participant.avatar_url !== "/assets/avatars/default.png" ? (
                      <img
                        src={participant.avatar_url}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                    )}
                  </div>
                  <span className="font-medium text-xs md:text-sm truncate ml-2">
                    {participant.name}
                  </span>
                  {emoji && (
                    <div
                      className="ml-2 w-6 h-6 md:w-7 md:h-7 animate-bounce-in"
                      title={emoji.emojiName}
                    >
                      <img
                        src={emoji.emojiImagePath}
                        alt={emoji.emojiName}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ParticipantList;
