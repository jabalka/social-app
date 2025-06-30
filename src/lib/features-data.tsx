import { BarChart3, Bell, FileText, Landmark, Lightbulb, MapPin, MessageCircle, Users } from "lucide-react";

export const features = [
  {
    title: "Public Project Portal",
    description:
      "Councils can publish upcoming, ongoing, or completed projects with full details like location, budgets, timelines, and visuals.",
    icon: <Landmark className="h-10 w-10" />,
  },
  {
    title: "Citizen Proposals",
    description:
      "Any user can propose community initiatives. Other residents can upvote, discuss, and improve these proposals.",
    icon: <Lightbulb className="h-10 w-10" />,
  },
  {
    title: "Interactive Discussions",
    description: "Open comment sections and threaded replies create meaningful conversations around urban ideas.",
    icon: <MessageCircle className="h-10 w-10" />,
  },
  {
    title: "Integrated Voting Mechanism",
    description: "Vote for or against proposals. Admins can set thresholds that trigger further review or action.",
    icon: <Users className="h-10 w-10" />,
  },
  {
    title: "Administrative Dashboards",
    description: "Admins can track engagement, respond to feedback, and manage the platform through powerful tools.",
    icon: <BarChart3 className="h-10 w-10" />,
  },
  {
    title: "Real-time Messaging & Notifications",
    description: "Instant updates keep everyone informed about status changes, admin responses, or project milestones.",
    icon: <Bell className="h-10 w-10" />,
  },
  {
    title: "Transparent Change Logs",
    description: "Every update is logged visibly to build trust and show project progress.",
    icon: <FileText className="h-10 w-10" />,
  },
  {
    title: "Geolocation-based Engagement",
    description: "Residents can explore local projects filtered by area or current location.",
    icon: <MapPin className="h-10 w-10" />,
  },
];