import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "TOEFL",
  name:     "TOEFL",
  fullName: "Test of English as a Foreign Language",
  org:      "ETS (Educational Testing Service)",
  website:  "https://www.ets.org/toefl",
  tagline:  "Leading internet-based English proficiency test for academic success",
  abbr:     "TOEFL"
};

export default function Toefl() {
  return <ExamPage config={config} />;
}
