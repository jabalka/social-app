export type IssueTypeValue = typeof ISSUE_TYPES[number]["value"];

export const ISSUE_TYPES = [
  {
    value: "POTHOLE",
    label: "Pothole",
    icon: "🕳️",
    autoFill: "Street pothole",
    description: "A hole in the road surface that can damage vehicles",
  },
  {
    value: "BROKEN_SIDEWALK",
    label: "Broken Sidewalk",
    icon: "🚶",
    autoFill: "Damaged sidewalk",
    description: "Cracked or uneven pavement creating a trip hazard",
  },
  {
    value: "STREET_LIGHT_FAILURE",
    label: "Street Light Failure",
    icon: "💡",
    autoFill: "Broken street light",
    description: "A street light that isn't functioning properly",
  },
  {
    value: "TRAFFIC_LIGHT_MALFUNCTION",
    label: "Traffic Light Malfunction",
    icon: "🚦",
    autoFill: "Malfunctioning traffic light",
    description: "Traffic signals not working correctly",
  },
  {
    value: "BROKEN_BENCH",
    label: "Broken Bench",
    icon: "🪑",
    autoFill: "Damaged public bench",
    description: "A public bench that is broken or unsafe",
  },
  {
    value: "DAMAGED_BUS_STOP",
    label: "Damaged Bus Stop",
    icon: "🚏",
    autoFill: "Damaged bus shelter",
    description: "Issues with bus stop infrastructure",
  },
  {
    value: "RUSTY_HANDRAIL",
    label: "Rusty Handrail",
    icon: "⚠️",
    autoFill: "Rusty dangerous handrail",
    description: "A corroded handrail that may be unsafe",
  },
  {
    value: "BROKEN_FENCE",
    label: "Broken Fence",
    icon: "🧱",
    autoFill: "Damaged fence",
    description: "A fence that is damaged or collapsed",
  },
  {
    value: "OVERGROWN_VEGETATION",
    label: "Overgrown Vegetation",
    icon: "🌱",
    autoFill: "Overgrown plants blocking path",
    description: "Plants or bushes obstructing walkways or visibility",
  },
  {
    value: "FALLEN_TREE",
    label: "Fallen Tree",
    icon: "🌳",
    autoFill: "Fallen tree blocking access",
    description: "A tree that has fallen onto a public area",
  },
  {
    value: "BLOCKED_DRAIN",
    label: "Blocked Drain",
    icon: "🏄",
    autoFill: "Blocked street drain",
    description: "A drain that is clogged or not functioning",
  },
  {
    value: "ILLEGAL_DUMPING",
    label: "Illegal Dumping",
    icon: "🚯",
    autoFill: "Illegal waste dumping",
    description: "Trash or waste improperly disposed of in public",
  },
  {
    value: "GRAFFITI",
    label: "Graffiti",
    icon: "🖌️",
    autoFill: "Unwanted graffiti",
    description: "Unauthorized markings or drawings on public property",
  },
  {
    value: "DAMAGED_SIGN",
    label: "Damaged Sign",
    icon: "⛔",
    autoFill: "Damaged street sign",
    description: "A traffic or information sign that is damaged or missing",
  },
  {
    value: "MISSING_MANHOLE_COVER",
    label: "Missing Manhole Cover",
    icon: "🚨",
    autoFill: "Missing/unsafe manhole cover",
    description: "A manhole cover that is missing, creating a safety hazard",
  },
  {
    value: "PLAYGROUND_DAMAGE",
    label: "Playground Damage",
    icon: "🛝",
    autoFill: "Damaged playground equipment",
    description: "Issues with playground equipment or surfaces",
  },
  {
    value: "WATER_LEAK",
    label: "Water Leak",
    icon: "💦",
    autoFill: "Water leak on street",
    description: "Water leaking from pipes or hydrants",
  },
  {
    value: "BROKEN_UTILITY_BOX",
    label: "Broken Utility Box",
    icon: "⚡",
    autoFill: "Damaged utility box",
    description: "A damaged electrical or telecommunications box",
  },
  {
    value: "ABANDONED_VEHICLE",
    label: "Abandoned Vehicle",
    icon: "🚗",
    autoFill: "Abandoned vehicle",
    description: "A vehicle that appears to be abandoned",
  },
  {
    value: "OTHER",
    label: "Other Issue",
    icon: "⁉️",
    autoFill: "Issue requiring attention",
    description: "Any other issue not listed above",
  },
];

export const ISSUE_PRIORITY_LEVELS = [
    { value: "LOW", label: "Low Priority", description: "Not urgent, can be addressed when convenient" },
    { value: "MEDIUM", label: "Medium Priority", description: "Should be addressed within a reasonable timeframe" },
    { value: "HIGH", label: "High Priority", description: "Requires prompt attention" },
    { value: "URGENT", label: "Urgent", description: "Immediate attention required due to safety concerns" },
  ];




//   import type { LucideIcon } from "lucide-react";


//   import { Footprints } from 'lucide-react';


//   export interface IssueCategory {
//       id: string;
//       name: string;
//       icon: LucideIcon;
//       autoFill: string;
//       description?: string;
//   }

//   export const ISSUE_CATEGORIES: IssueCategory[] = [
//     {
//       id: "pothole",
//       name: "Potholes",
//       icon: Footprints,
//       autoFill: "Street pothole",
//       description: "A hole in the road surface that can damage vehicles",
//     },
//     {
//       id: "sidewalk",
//       name: "Sidewalk Issues",
//       icon: Footprints,
//       autoFill: "Damaged sidewalk",
//       description: "Cracked or uneven pavement creating a trip hazard",
//     },
//     {
//       id: "street-light",
//       name: "Street Light Issues",
//       icon: Footprints,
//       autoFill: "Broken street light",
//       description: "A street light that isn't functioning properly",
//     },
//     {
//       id: "traffic-light",
//       name: "Traffic Light Issues",
//       icon: Footprints,
//       autoFill: "Malfunctioning traffic light",
//       description: "Traffic signals not working correctly",
//     },
//     {
//       id: "public-furniture",
//       name: "Public Furniture Issues",
//       icon: Footprints,
//       autoFill: "Damaged public bench or furniture",
//       description: "Issues with public benches, tables, or other furniture",
//     },
//     {
//       id: "vegetation",
//       name: "Vegetation Issues",
//       icon: Footprints,
//       autoFill: "Overgrown vegetation blocking path",
//       description: "Plants or bushes obstructing walkways or visibility",
//     },
//     {
//       id: "drainage",
//       name: "Drainage Issues",
//       icon: Footprints,
//       autoFill: "Blocked street drain or drainage issue",
//       description: "A drain that is clogged or not functioning properly",
//     },
//     {
//       id: "illegal-dumping",
//       name: "Illegal Dumping Issues",
//       icon: Footprints,
//       autoFill: "Illegal waste dumping in public area",
//       description: "Trash or waste improperly disposed of in public areas",
//     },
//     {
//       id: "graffiti-vandalism",
//       name: "Graffiti and Vandalism Issues",
//       icon: Footprints,
//       autoFill: "Unwanted graffiti or vandalism on property",
//       description:
//         "Unauthorized markings or drawings on public property, including graffiti and vandalism issues.",
//     },
//     {
//         id: 'other',
//         name: 'Other Issues',
//         icon: Footprints,
//         autoFill: 'Issue requiring attention',
//         description:
//           'Any other issue not listed above that requires attention.',
//     },
//   ]