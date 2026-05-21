import {
  HiOutlineBookOpen,
  HiOutlineDesktopComputer,
  HiOutlineCog,
  HiOutlineHome,
  HiOutlineShoppingBag,
  HiOutlineTicket,
  HiOutlineTruck,
  HiOutlineCube,
} from 'react-icons/hi';
import { GiGamepad, GiCat } from 'react-icons/gi';
import { CgGym } from 'react-icons/cg';

export const CATEGORIES = [
  {
    id: 'textbooks-notes',
    name: 'Textbooks & Notes',
    icon: HiOutlineBookOpen,
    emoji: '📚',
    color: 'bg-primary-500',
    description: 'Books, notes, solved papers, study guides',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: HiOutlineDesktopComputer,
    emoji: '💻',
    color: 'bg-accent-500',
    description: 'Laptops, phones, tablets, accessories',
  },
  {
    id: 'project-components',
    name: 'Project Components',
    icon: HiOutlineCog,
    emoji: '🔧',
    color: 'bg-primary-500',
    description: 'Arduino, Raspberry Pi, sensors, motors, breadboards, ICs',
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: GiGamepad,
    emoji: '🎮',
    color: 'bg-accent-500',
    description: 'Consoles, controllers, games, gaming peripherals',
  },
  {
    id: 'hostel-essentials',
    name: 'Hostel Essentials',
    icon: HiOutlineHome,
    emoji: '🛋️',
    color: 'bg-primary-500',
    description: 'Furniture, appliances, room decor',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: HiOutlineShoppingBag,
    emoji: '👕',
    color: 'bg-accent-500',
    description: 'Clothing, shoes, bags, accessories',
  },
  {
    id: 'pets',
    name: 'Pets',
    icon: GiCat,
    emoji: '🐾',
    color: 'bg-primary-500',
    description: 'Pet adoption, pet supplies, food, accessories',
  },
  {
    id: 'sports-fitness',
    name: 'Sports & Fitness',
    icon: CgGym,
    emoji: '🏋️',
    color: 'bg-accent-500',
    description: 'Rackets, gym gear, musical instruments',
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: HiOutlineTruck,
    emoji: '🚲',
    color: 'bg-primary-500',
    description: 'Bicycles, two-wheelers, accessories',
  },
  {
    id: 'events-tickets',
    name: 'Events & Tickets',
    icon: HiOutlineTicket,
    emoji: '🎟️',
    color: 'bg-accent-500',
    description: 'Fest passes, concert tickets',
  },
  {
    id: 'others',
    name: 'Others',
    icon: HiOutlineCube,
    emoji: '📦',
    color: 'bg-primary-500',
    description: 'Miscellaneous items',
  },
];

export const CONDITIONS = [
  { value: 'new', label: 'New', color: 'text-green-400' },
  { value: 'like-new', label: 'Like New', color: 'text-blue-400' },
  { value: 'good', label: 'Good', color: 'text-yellow-400' },
  { value: 'fair', label: 'Fair', color: 'text-orange-400' },
];

// Full department list matching TKMCE spreadsheet
export const DEPARTMENTS = [
  'Civil Engineering',
  'Mechanical Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Computer Science and Engineering',
  'Chemical Engineering',
  'Electrical & Computer Engineering',
  'Architecture',
  'Computer Science & Engineering (AI)',
  'MCA',
  'MTech',
];

// Departments with Section A & B choice — shows A/B dropdown
export const A_B_SECTION_DEPARTMENTS = new Set([
  'Civil Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Computer Science and Engineering',
]);

// Departments that have ONLY Section A — picker hidden, auto-set to A.
export const SINGLE_SECTION_DEPARTMENTS = new Set([
  'Chemical Engineering',
  'Electrical & Computer Engineering',
  'Architecture',
  'Computer Science & Engineering (AI)',
  'MCA',
]);

// Departments that have NO sections at all (MTech) — section is irrelevant.
export const NO_SECTION_DEPARTMENTS = new Set([
  'MTech',
]);


export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'most-viewed', label: 'Most Viewed' },
];
