import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "GMAT",
  name:     "GMAT",
  fullName: "Graduate Management Admission Test",
  org:      "GMAC (Graduate Management Admission Council)",
  website:  "https://www.mba.com",
  tagline:  "The premier exam for admission to business schools globally",
  abbr:     "GMAT"
};

export default function Gmat() {
  return <ExamPage config={config} />;
}
