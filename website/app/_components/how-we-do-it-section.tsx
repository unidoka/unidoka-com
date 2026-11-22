import { FaqSection, type FaqItem } from "@/components/faq-section";

const FAQ_ITEMS: FaqItem[] = [
  {
    questionKey: "home.faq_q1",
    answerKey: "home.faq_a1",
    image: "/images/home/support.png",
  },
  {
    questionKey: "home.faq_q2",
    answerKey: "home.faq_a2",
    image: "/images/home/talents.png",
  },
  {
    questionKey: "home.faq_q3",
    answerKey: "home.faq_a3",
    image: "/images/home/innovations.png",
  },
  {
    questionKey: "home.faq_q4",
    answerKey: "home.faq_a4",
    image: "/images/home/horizons.png",
  },
];

export function HowWeDoItSection() {
  return (
    <FaqSection
      titleKey="home.numbers_title"
      items={FAQ_ITEMS}
      autoRotateInterval={5000}
    />
  );
}

export default HowWeDoItSection;
