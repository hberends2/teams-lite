
import { MessageSquare } from "lucide-react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-teams-primary text-white rounded-md p-1">
        <MessageSquare size={18} />
      </div>
      <span className="font-semibold text-lg">Teams Lite</span>
    </div>
  );
}
