import Container from "../common/Container";
import GradientText from "../common/GradientText";
import SectionHeading from "../common/SectionHeading";
import ScrollReveal from "../animation/ScrollReveal";
import Marquee from "../animation/Marquee";
import CourseCard from "./CourseCard";
import { courses, coursesIntro } from "../../data/courses";
import { animationConfig } from "../../utils/animation";

export default function CoursesSection() {
  return (
    <section className="inv-section" id="courses" aria-labelledby="courses-title">
      <Container>
        <ScrollReveal>
          <SectionHeading
            id="courses-title"
            eyebrow={coursesIntro.eyebrow}
            title={<>Learn Skills. <GradientText>Build Projects.</GradientText> Become Industry Ready.</>}
            description={coursesIntro.description}
          />
        </ScrollReveal>
      </Container>
      <div className="inv-courses-stage">
        <Marquee
          items={courses}
          speed={animationConfig.marquee.course}
          direction="left"
          label="Courses"
          renderItem={(course, _i, hidden) => <CourseCard {...course} hidden={hidden} />}
        />
      </div>
    </section>
  );
}