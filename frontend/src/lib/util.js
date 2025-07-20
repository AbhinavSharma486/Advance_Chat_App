export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // Indian Standard Time
  });
}

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "🥲", "🙏🏻"];

// Group messages by date (returns an array of { dateLabel, messages })
export function groupMessagesByDate(messages) {
  if (!messages || messages.length === 0) return [];

  const groups = [];
  let lastDate = null;
  let currentGroup = null;

  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt);
    const dateKey = msgDate.toDateString();

    if (dateKey !== lastDate) {
      if (currentGroup) groups.push(currentGroup);

      currentGroup = {
        dateLabel: formatDateLable(msgDate),
        dateKey,
        messages: [msg],
      };

      lastDate = dateKey;
    }
    else {
      currentGroup.messages.push(msg);
    }
  });

  if (currentGroup) groups.push(currentGroup);
  return groups;
}

// Format date as 'Today', 'Yesterday', or readable date
export function formatDateLable(date) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dateStr = date.toDateString();
  if (dateStr === today.toDateString()) return 'Today';
  if (dateStr === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

}

export function getAvatarUrl(profilePic) {
  if (!profilePic) return "/avatar.png";
  if (profilePic.startsWith("http")) return profilePic;
  return `http://localhost:5000/uploads/${profilePic}`;
}