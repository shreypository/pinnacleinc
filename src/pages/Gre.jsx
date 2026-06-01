import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "GRE",
  name:     "GRE",
  fullName: "Graduate Record Examinations",
  org:      "ETS (Educational Testing Service)",
  website:  "https://www.ets.org/gre",
  tagline:  "Required for admission to most graduate programs worldwide",
  abbr:     "GRE"
};

export default function Gre() {
  return <ExamPage config={config} />;
}
