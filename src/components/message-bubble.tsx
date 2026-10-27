import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Message } from "@/types";

type MessageBubbleProps = {
  message: Message;
  isOwn: boolean;
  senderName: string;
};

export function MessageBubble({ message, isOwn, senderName }: MessageBubbleProps) {
  return (
    <li data-message-id={message._id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn(
        "min-w-0 max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%]",
        isOwn ? "bg-brand rounded-br-md text-white" : "rounded-bl-md border bg-white text-foreground",
      )}>
        <span className="sr-only">{isOwn ? "You" : senderName} said: </span>
        <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">{message.content}</p>
        <time
          dateTime={message.createdAt}
          title={new Date(message.createdAt).toLocaleString("en-IN")}
          className={cn("mt-1.5 block text-right text-[10px]", isOwn ? "text-white/80" : "text-muted-foreground")}
        >
          {format(new Date(message.createdAt), "h:mm a")}
        </time>
      </div>
    </li>
  );
}
