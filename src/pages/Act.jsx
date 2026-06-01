import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "ACT",
  name:     "ACT",
  fullName: "American College Testing",
  org:      "ACT Inc.",
  website:  "https://www.act.org",
  tagline:  "Curriculum-based achievement test for college readiness",
  abbr:     "ACT"
};

export default function Act() {
  return <ExamPage config={config} />;
}
