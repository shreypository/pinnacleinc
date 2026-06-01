import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "SAT",
  name:     "SAT",
  fullName: "Scholastic Assessment Test",
  org:      "College Board",
  website:  "https://satsuite.collegeboard.org",
  tagline:  "Standardized test for college admissions in the United States",
  abbr:     "SAT"
};

export default function Sat() {
  return <ExamPage config={config} />;
}
