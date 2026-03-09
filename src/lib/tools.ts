import {
  Eraser, ImageOff, Type, Stamp, Scissors, Blur,
  Replace, ArrowUpCircle, Focus, Palette, History,
  Crop, Maximize, RotateCw, FileDown, Wand2,
  Ghost, Sparkles, UserCircle
} from 'lucide-react';

export interface ToolDef {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  icon: typeof Eraser;
  category: string;
  path: string;
  featured?: boolean;
  working?: boolean;
  badge?: string;
}

export const categories = [
  { id: 'all', label: 'সকল টুলস', labelEn: 'All Tools' },
  { id: 'watermark', label: 'ওয়াটারমার্ক', labelEn: 'Watermark' },
  { id: 'background', label: 'ব্যাকগ্রাউন্ড', labelEn: 'Background' },
  { id: 'enhance', label: 'এনহ্যান্স', labelEn: 'Enhancement' },
  { id: 'edit', label: 'এডিটিং', labelEn: 'Editing' },
  { id: 'creative', label: 'ক্রিয়েটিভ AI', labelEn: 'Creative AI' },
];

export const tools: ToolDef[] = [
  // Watermark Tools
  {
    id: 'gemini-watermark-remover',
    name: 'Gemini Watermark Remover',
    nameBn: 'জেমিনি ওয়াটারমার্ক রিমুভার',
    description: 'Remove Gemini AI watermarks instantly using reverse alpha blending',
    icon: Eraser,
    category: 'watermark',
    path: '/watermark-remover',
    featured: true,
    working: true,
    badge: 'Featured',
  },
  {
    id: 'object-remover',
    name: 'Object Remover',
    nameBn: 'অবজেক্ট রিমুভার',
    description: 'Remove unwanted objects from photos with AI inpainting',
    icon: ImageOff,
    category: 'watermark',
    path: '/tool/object-remover',
  },
  {
    id: 'text-remover',
    name: 'Text Remover',
    nameBn: 'টেক্সট রিমুভার',
    description: 'Erase text overlays from images cleanly',
    icon: Type,
    category: 'watermark',
    path: '/tool/text-remover',
  },
  {
    id: 'logo-remover',
    name: 'Logo Remover',
    nameBn: 'লোগো রিমুভার',
    description: 'Remove logos and brand marks from images',
    icon: Stamp,
    category: 'watermark',
    path: '/tool/logo-remover',
  },

  // Background Tools
  {
    id: 'background-remover',
    name: 'Background Remover',
    nameBn: 'ব্যাকগ্রাউন্ড রিমুভার',
    description: 'Remove image backgrounds instantly with AI',
    icon: Scissors,
    category: 'background',
    path: '/tool/background-remover',
    badge: 'Popular',
  },
  {
    id: 'background-blur',
    name: 'Background Blur',
    nameBn: 'ব্যাকগ্রাউন্ড ব্লার',
    description: 'Add professional bokeh blur to any background',
    icon: Blur,
    category: 'background',
    path: '/tool/background-blur',
  },
  {
    id: 'background-changer',
    name: 'Background Changer',
    nameBn: 'ব্যাকগ্রাউন্ড চেঞ্জার',
    description: 'Replace backgrounds with custom images or colors',
    icon: Replace,
    category: 'background',
    path: '/tool/background-changer',
  },

  // Enhancement Tools
  {
    id: 'ai-upscaler',
    name: 'AI Upscaler',
    nameBn: 'AI আপস্কেলার',
    description: 'Upscale images 2x-4x with AI super resolution',
    icon: ArrowUpCircle,
    category: 'enhance',
    path: '/tool/ai-upscaler',
    badge: 'New',
  },
  {
    id: 'image-sharpener',
    name: 'Image Sharpener',
    nameBn: 'ইমেজ শার্পেনার',
    description: 'Sharpen blurry photos with intelligent enhancement',
    icon: Focus,
    category: 'enhance',
    path: '/tool/image-sharpener',
  },
  {
    id: 'color-enhancer',
    name: 'Color Enhancer',
    nameBn: 'কালার এনহ্যান্সার',
    description: 'Enhance colors and vibrancy automatically',
    icon: Palette,
    category: 'enhance',
    path: '/tool/color-enhancer',
  },
  {
    id: 'old-photo-restore',
    name: 'Old Photo Restore',
    nameBn: 'পুরাতন ফটো রিস্টোর',
    description: 'Restore and colorize old damaged photographs',
    icon: History,
    category: 'enhance',
    path: '/tool/old-photo-restore',
  },

  // Editing Tools
  {
    id: 'crop',
    name: 'Crop Image',
    nameBn: 'ক্রপ',
    description: 'Crop images to any size or aspect ratio',
    icon: Crop,
    category: 'edit',
    path: '/tool/crop',
  },
  {
    id: 'resize',
    name: 'Resize Image',
    nameBn: 'রিসাইজ',
    description: 'Resize images to exact dimensions',
    icon: Maximize,
    category: 'edit',
    path: '/tool/resize',
  },
  {
    id: 'rotate',
    name: 'Rotate Image',
    nameBn: 'রোটেট',
    description: 'Rotate and flip images with precision',
    icon: RotateCw,
    category: 'edit',
    path: '/tool/rotate',
  },
  {
    id: 'compress',
    name: 'Image Compressor',
    nameBn: 'ইমেজ কম্প্রেসর',
    description: 'Compress images without quality loss',
    icon: FileDown,
    category: 'edit',
    path: '/tool/compress',
  },

  // Creative AI Tools
  {
    id: 'ai-cartoon',
    name: 'AI Cartoon Converter',
    nameBn: 'AI কার্টুন কনভার্টার',
    description: 'Convert photos to cartoon/illustration style',
    icon: Wand2,
    category: 'creative',
    path: '/tool/ai-cartoon',
  },
  {
    id: 'ai-anime',
    name: 'AI Anime Converter',
    nameBn: 'AI অ্যানিমে কনভার্টার',
    description: 'Transform photos to anime art style',
    icon: Ghost,
    category: 'creative',
    path: '/tool/ai-anime',
  },
  {
    id: 'ai-image-gen',
    name: 'AI Image Generator',
    nameBn: 'AI ইমেজ জেনারেটর',
    description: 'Generate images from text prompts',
    icon: Sparkles,
    category: 'creative',
    path: '/tool/ai-image-gen',
  },
  {
    id: 'ai-avatar',
    name: 'AI Avatar Generator',
    nameBn: 'AI অ্যাভাটার জেনারেটর',
    description: 'Create unique AI-generated avatars',
    icon: UserCircle,
    category: 'creative',
    path: '/tool/ai-avatar',
  },
];
