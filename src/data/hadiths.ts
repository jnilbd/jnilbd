export type Hadith = { id: number; cat: string; source: string; bn: string; tafsir?: string };

export const HADITH_CATEGORIES = [
  "সব", "ব্যবসা", "বিয়ে ও পরিবার", "হালাল-হারাম", "মাতা-পিতা",
  "প্রতিবেশী", "ইবাদত ও নামাজ", "রোজা ও যাকাত", "দান-সদকা", "সততা ও আমানত",
  "চরিত্র", "জ্ঞান অর্জন", "ক্ষমা ও দয়া", "ধৈর্য", "তওবা",
  "নিয়ত", "মুখের হেফাজত", "গীবত ও মিথ্যা", "আখিরাত", "দোয়া"
];

export const HADITHS: Hadith[] = [];
