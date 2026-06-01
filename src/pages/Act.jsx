import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "ACT",
  name:     "ACT",
  fullName: "American College Testing",
  org:      "ACT Inc.",
  website:  "https://www.act.org",
  tagline:  "Curriculum-based achievement test for college readiness",
  abbr:     "ACT",
  brand:    ["#d81e2c", "#a01722"],   // ACT red
  logoUrl:  null
};

export default function Act() {
  return <ExamPage config={config} />;
}
