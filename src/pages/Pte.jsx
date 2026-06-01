import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "PTE",
  name:     "PTE Academic",
  fullName: "Pearson Test of English — Academic",
  org:      "Pearson",
  website:  "https://www.pearsonpte.com",
  tagline:  "AI-scored English proficiency test accepted worldwide",
  abbr:     "PTE",
  brand:    ["#6c2eb7", "#9b4dca"],   // Pearson amethyst
  logoUrl:  null
};

export default function Pte() {
  return <ExamPage config={config} />;
}
