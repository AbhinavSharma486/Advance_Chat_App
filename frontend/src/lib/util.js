export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // Indian Standard Time
  });
}

export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "🥲", "🙏🏻"];