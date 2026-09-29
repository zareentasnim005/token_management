// এই ফাইলটি অ্যাপ এবং seed স্ক্রিপ্ট দুই জায়গাতেই ব্যবহার হয় (কোনো env/Firebase নির্ভরতা নেই)।

export const HALLS = [
  { hallId: 'july6', name: '৬ জুলাই হল', nameEn: 'July 6 Hall', gender: 'male', isActive: true },
  { hallId: 'shadhinota', name: 'স্বাধীনতা হল', nameEn: 'Shadhinota Hall', gender: 'male', isActive: true },
  { hallId: 'gonotontro', name: 'গণতন্ত্র হল', nameEn: 'Gonotontro Hall', gender: 'female', isActive: true },
  { hallId: 'matrivasha', name: 'মাতৃভাষা হল', nameEn: 'Matrivasha Hall', gender: 'female', isActive: true },
];

export const MEAL_OPTIONS = [
  { mealId: 'breakfast_egg_veg', meal: 'breakfast', menu: 'ভাত + ডিম + সবজি', price: 30, isActive: true },
  { mealId: 'breakfast_egg_bhorta', meal: 'breakfast', menu: 'ভাত + ডিম + ভর্তা', price: 25, isActive: true },
  { mealId: 'lunch_fish', meal: 'lunch', menu: 'ভাত + মাছ', price: 40, isActive: true },
  { mealId: 'lunch_chicken', meal: 'lunch', menu: 'ভাত + মুরগি', price: 45, isActive: true },
  { mealId: 'dinner_veg_bhorta', meal: 'dinner', menu: 'ভাত + সবজি + ভর্তা', price: 30, isActive: true },
  { mealId: 'dinner_fish_bhorta', meal: 'dinner', menu: 'ভাত + মাছ + ভর্তা', price: 45, isActive: true },
];

// ডেমো শিক্ষার্থী (users collection) — ডকুমেন্ট আইডি = studentId
export const STUDENTS = [
  { studentId: '2021101001', name: 'রাহেলা বেগম', gender: 'female', hallId: 'gonotontro', department: 'ইংরেজি', year: 4 },
  { studentId: '2022201001', name: 'সুমাইয়া আক্তার', gender: 'female', hallId: 'gonotontro', department: 'কম্পিউটার সায়েন্স', year: 3 },
  { studentId: '2023301001', name: 'মাহফুজা খানম', gender: 'female', hallId: 'gonotontro', department: 'ফার্মেসি', year: 2 },
  { studentId: '2023301002', name: 'নুসরাত জাহান', gender: 'female', hallId: 'matrivasha', department: 'গণিত', year: 2 },
  { studentId: '2022201002', name: 'রাকিবুল হাসান', gender: 'male', hallId: 'july6', department: 'মেকানিক্যাল', year: 3 },
  { studentId: '2022201003', name: 'মেহেদী হাসান', gender: 'male', hallId: 'shadhinota', department: 'ইইই', year: 3 },
].map((s) => ({ ...s, email: `${s.studentId}@student.pust.ac.bd` }));
