import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "PTE",
  name:     "PTE Academic",
  fullName: "Pearson Test of English — Academic",
  org:      "Pearson",
  website:  "https://www.pearsonpte.com",
  tagline:  "AI-scored English proficiency test accepted worldwide",
  abbr:     "PTE"
};

export default function Pte() {
  return <ExamPage config={config} />;
}
