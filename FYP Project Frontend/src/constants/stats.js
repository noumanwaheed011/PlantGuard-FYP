import { BadgeCheck, Leaf, Timer } from 'lucide-react';

/** Shared homepage / about stats — tied to real app capabilities */
export const APP_STATS = [
  {
    value: '94%',
    label: 'Model Accuracy',
    description: 'Deep-learning detection you can rely on',
    icon: BadgeCheck,
  },
  {
    value: '10',
    label: 'Disease Classes',
    description: 'Jackfruit diseases plus healthy detection',
    icon: Leaf,
  },
  {
    value: '5 sec',
    label: 'Instant Results',
    description: 'Upload a photo and get a diagnosis fast',
    icon: Timer,
  },
];
