import { useNavigate } from "react-router-dom";

interface ActivityCardProps {
  friendId: string;
  friendName: string;
  friendPhoto: string;
  activityType: 'habit' | 'streak_milestone' | 'challenge' | 'task' | 'level_up';
  activityText: string;
  metadata: {
    habitName?: string;
    streakCount?: number;
    xpGained?: number;
    challengeTitle?: string;
    level?: number;
    taskTitle?: string;
    opponentId?: string;
    opponentName?: string;
  };
  timeAgo: string;
}

const DEFAULT_AVATAR = "/assets/user.png";

export default function ActivityCard({
  friendId,
  friendName,
  friendPhoto,
  activityType,
  activityText,
  metadata,
  timeAgo,
}: ActivityCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/${friendId}`);
  };

  const handleNameClick = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  // Get emoji based on activity type
  const getEmoji = () => {
    switch (activityType) {
      case 'habit':
        return '✅';
      case 'streak_milestone':
        return '🎉';
      case 'challenge':
        return '⚡';
      case 'task':
        return '📝';
      case 'level_up':
        return '⭐';
      default:
        return '✨';
    }
  };

  // Get additional context text
  const getContextText = () => {
    if (activityType === 'habit' && metadata.streakCount) {
      return `🔥 ${metadata.streakCount}-day streak`;
    }
    if ((activityType === 'challenge' || activityType === 'task') && metadata.xpGained) {
      return `+${metadata.xpGained} XP`;
    }
    return null;
  };

  // Get first name only
  const getFirstName = (fullName: string) => {
    return fullName.split(' ')[0];
  };

  // Parse activity text to make opponent's first name clickable in challenges
  const renderActivityText = () => {
    // For challenges, make the opponent's name clickable
    if (activityType === 'challenge' && metadata.opponentId && metadata.opponentName) {
      const opponentFirstName = getFirstName(metadata.opponentName);
      const fullOpponentName = metadata.opponentName;
      
      // Replace the full opponent name with clickable first name in the text
      const textBeforeName = activityText.substring(0, activityText.lastIndexOf(fullOpponentName));
      const textAfterName = activityText.substring(activityText.lastIndexOf(fullOpponentName) + fullOpponentName.length);
      
      return (
        <span>
          {textBeforeName}
          <span
            onClick={(e) => handleNameClick(e, metadata.opponentId!)}
            className="text-red-400 hover:text-red-300 underline cursor-pointer font-semibold"
          >
            {opponentFirstName}
          </span>
          {textAfterName}
        </span>
      );
    }

    // For other activities, just return the text
    return activityText;
  };

  return (
    <div
      onClick={handleClick}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 sm:p-6 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        {/* Friend Photo */}
        <img
          src={friendPhoto || DEFAULT_AVATAR}
          alt={friendName}
          className="w-14 h-14 rounded-full border-2 border-zinc-700 object-cover group-hover:border-red-500 group-hover:scale-110 transition-all duration-300 shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).src = DEFAULT_AVATAR;
          }}
        />

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          {/* Friend Name - FULL NAME (not clickable separately, whole card is clickable) */}
          <h3 className="text-white font-bold text-lg mb-1.5 group-hover:text-red-400 transition-colors">
            {friendName}
          </h3>

          {/* Activity Text with clickable opponent first name for challenges */}
          <p className="text-zinc-300 text-base mb-3 leading-relaxed">
            <span className="mr-2 text-lg">{getEmoji()}</span>
            {renderActivityText()}
          </p>

          {/* Context & Time */}
          <div className="flex items-center gap-3 text-sm">
            {getContextText() && (
              <>
                <span className="text-red-400 font-semibold bg-red-500/10 px-2.5 py-1 rounded-md">
                  {getContextText()}
                </span>
                <span className="text-zinc-600">•</span>
              </>
            )}
            <span className="text-zinc-500">{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}