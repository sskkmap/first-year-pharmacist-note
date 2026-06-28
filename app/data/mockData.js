const startYear = 2022;
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth(); // 0 is January, 3 is April
const yearOfExperience = currentYear - startYear + (currentMonth >= 3 ? 1 : 0);

export const profileData = {
  name: "あおさん",
  role: `薬剤師${yearOfExperience}年目`,
  bio: "個人在宅をメインとした調剤薬局の薬剤師です。\n実際に私が行った新人教育や研修の実施を行った経験を通して\n全ての薬剤師が安心して業務を行えるようにサイトを作成しました。\n私自身も使いたいなと思えるツールの開発や\n「処方箋から病気を読む」をテーマに、\n若手薬剤師向けの現場で使える実践知識を発信中。",
  avatar: "/placeholder-avatar.png", // Will need a real image or a generated one
};

export const categories = [
  { id: "git", name: "消化器系", color: "hsl(180, 60%, 40%)" },
  { id: "cvs", name: "循環器系", color: "hsl(0, 70%, 60%)" },
  { id: "res", name: "呼吸器系", color: "hsl(140, 60%, 50%)" },
  { id: "meta", name: "代謝・内分泌", color: "hsl(30, 90%, 60%)" },
  { id: "neuro", name: "神経系", color: "hsl(260, 60%, 60%)" },
  { id: "immune", name: "免疫系", color: "hsl(300, 60%, 55%)" },
  { id: "heme", name: "血液", color: "hsl(350, 65%, 55%)" },
  { id: "ped", name: "小児科", color: "hsl(200, 80%, 55%)" },
  { id: "tool", name: "ツール", color: "hsla(64, 100%, 40%, 1.00)" },
  { id: "admin", name: "医療事務", color: "hsla(0, 0%, 0%, 1.00)" },
  { id: "zaitaku", name: "在宅医療", color: "hsl(210, 20%, 50%)" },
  { id: "other", name: "雑談・その他", color: "hsl(210, 20%, 50%)" },
];


