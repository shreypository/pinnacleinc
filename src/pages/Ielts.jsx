import ExamPage from "../components/exam/ExamPage";

const config = {
  key:      "IELTS",
  name:     "IELTS",
  fullName: "International English Language Testing System",
  org:      "British Council / IDP / Cambridge",
  website:  "https://www.ielts.org",
  tagline:  "World's most popular English language proficiency test",
  abbr:     "IELTS",
  brand:    ["#e31837", "#b01228"],   // IELTS red
  logoUrl:  null
};

export default function Ielts() {
  return <ExamPage config={config} />;
}
