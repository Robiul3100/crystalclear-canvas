import {
  Eraser, Eye, Type, Stamp,
  ImageMinus, Blend, Replace,
  ArrowUpFromDot, Focus, Palette, RotateCw,
  Crop, Maximize, RotateCcw, FileArchive,
  Laugh, Clapperboard, Wand2, UserCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
  category: string;
  color: string;
  badge?: string;
  available: boolean;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const categories: Category[] = [
  { id: 'watermark', title: 'ওয়াটারমার্ক টুলস', description: 'ইমেজ থেকে ওয়াটারমার্ক, টেক্সট, লোগো রিমুভ করুন', icon: Eraser, color: 'text-primary' },
  { id: 'background', title: 'ব্যাকগ্রাউন্ড টুলস', description: 'ব্যাকগ্রাউন্ড রিমুভ, ব্লার বা পরিবর্তন করুন', icon: ImageMinus, color: 'text-accent' },
  { id: 'enhance', title: 'এনহান্সমেন্ট টুলস', description: 'ইমেজ আপস্কেল, শার্পেন ও কালার এনহান্স করুন', icon: ArrowUpFromDot, color: 'text-primary' },
  { id: 'edit', title: 'এডিটিং টুলস', description: 'ক্রপ, রিসাইজ, রোটেট ও কম্প্রেস করুন', icon: Crop, color: 'text-accent' },
  { id: 'creative', title: 'ক্রিয়েটিভ AI টুলস', description: 'AI দিয়ে কার্টুন, অ্যানিমে, অ্যাভাটার তৈরি করুন', icon: Wand2, color: 'text-primary' },
];

export const tools: Tool[] = [
  // Watermark
  { id: 'gemini-watermark', icon: Eraser, title: 'Gemini ওয়াটারমার্ক রিমুভার', description: 'Gemini AI ইমেজ থেকে ওয়াটারমার্ক রিমুভ করুন', path: '/watermark-remover', category: 'watermark', color: 'text-primary', badge: 'Featured', available: true },
  { id: 'object-remover', icon: Eye, title: 'অবজেক্ট রিমুভার', description: 'ইমেজ থেকে অবাঞ্ছিত অবজেক্ট মুছুন', path: '/tools/object-remover', category: 'watermark', color: 'text-primary', available: false },
  { id: 'text-remover', icon: Type, title: 'টেক্সট রিমুভার', description: 'ইমেজ থেকে টেক্সট ওভারলে রিমুভ করুন', path: '/tools/text-remover', category: 'watermark', color: 'text-primary', available: false },
  { id: 'logo-remover', icon: Stamp, title: 'লোগো রিমুভার', description: 'ছবি থেকে লোগো ওয়াটারমার্ক মুছুন', path: '/tools/logo-remover', category: 'watermark', color: 'text-primary', available: false },

  // Background
  { id: 'bg-remover', icon: ImageMinus, title: 'ব্যাকগ্রাউন্ড রিমুভার', description: 'ইমেজ থেকে ব্যাকগ্রাউন্ড রিমুভ করুন', path: '/tools/bg-remover', category: 'background', color: 'text-accent', available: false },
  { id: 'bg-blur', icon: Blend, title: 'ব্যাকগ্রাউন্ড ব্লার', description: 'ব্যাকগ্রাউন্ডে ব্লার ইফেক্ট যোগ করুন', path: '/tools/bg-blur', category: 'background', color: 'text-accent', available: false },
  { id: 'bg-changer', icon: Replace, title: 'ব্যাকগ্রাউন্ড চেঞ্জার', description: 'নতুন ব্যাকগ্রাউন্ড দিয়ে বদলে দিন', path: '/tools/bg-changer', category: 'background', color: 'text-accent', available: false },

  // Enhancement
  { id: 'upscaler', icon: ArrowUpFromDot, title: 'AI আপস্কেলার', description: 'ইমেজ রেজোলিউশন AI দিয়ে বাড়ান', path: '/tools/upscaler', category: 'enhance', color: 'text-primary', available: false },
  { id: 'sharpener', icon: Focus, title: 'ইমেজ শার্পেনার', description: 'ব্লারি ইমেজ শার্প করুন', path: '/tools/sharpener', category: 'enhance', color: 'text-primary', available: false },
  { id: 'color-enhance', icon: Palette, title: 'কালার এনহান্সার', description: 'ইমেজের কালার ভাইব্রেন্সি বাড়ান', path: '/tools/color-enhance', category: 'enhance', color: 'text-primary', available: false },
  { id: 'photo-restore', icon: RotateCw, title: 'ওল্ড ফটো রিস্টোর', description: 'পুরানো ছবি AI দিয়ে রিস্টোর করুন', path: '/tools/photo-restore', category: 'enhance', color: 'text-primary', available: false },

  // Editing
  { id: 'crop', icon: Crop, title: 'ক্রপ', description: 'ইমেজ ক্রপ করুন যেকোনো সাইজে', path: '/tools/crop', category: 'edit', color: 'text-accent', available: false },
  { id: 'resize', icon: Maximize, title: 'রিসাইজ', description: 'ইমেজ সাইজ পরিবর্তন করুন', path: '/tools/resize', category: 'edit', color: 'text-accent', available: false },
  { id: 'rotate', icon: RotateCcw, title: 'রোটেট', description: 'ইমেজ রোটেট ও ফ্লিপ করুন', path: '/tools/rotate', category: 'edit', color: 'text-accent', available: false },
  { id: 'compress', icon: FileArchive, title: 'কম্প্রেস', description: 'ইমেজ সাইজ কমান কোয়ালিটি বজায় রেখে', path: '/tools/compress', category: 'edit', color: 'text-accent', available: false },

  // Creative
  { id: 'cartoon', icon: Laugh, title: 'AI কার্টুন কনভার্টার', description: 'ছবিকে কার্টুন স্টাইলে রূপান্তর করুন', path: '/tools/cartoon', category: 'creative', color: 'text-primary', available: false },
  { id: 'anime', icon: Clapperboard, title: 'AI অ্যানিমে কনভার্টার', description: 'ছবিকে অ্যানিমে স্টাইলে পরিবর্তন করুন', path: '/tools/anime', category: 'creative', color: 'text-primary', available: false },
  { id: 'img-gen', icon: Wand2, title: 'AI ইমেজ জেনারেটর', description: 'টেক্সট থেকে ইমেজ তৈরি করুন', path: '/tools/img-gen', category: 'creative', color: 'text-primary', available: false },
  { id: 'avatar', icon: UserCircle, title: 'AI অ্যাভাটার জেনারেটর', description: 'আপনার AI অ্যাভাটার তৈরি করুন', path: '/tools/avatar', category: 'creative', color: 'text-primary', available: false },
];
