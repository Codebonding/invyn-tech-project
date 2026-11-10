import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import {
  useCompleteLessonMutation,
  useGetStudentDashboardQuery,
  useMarkNotificationReadMutation,
} from "../services/studentApi";
import { ROUTES } from "../utils/constant";
import ProfileCard from "../components/student/ProfileCard";
import StatCard from "../components/student/StatCard";
import MyCourses from "../components/student/MyCourses";
import ActivityTimeline from "../components/student/ActivityTimeline";
import SessionList from "../components/student/SessionList";
import AnnouncementList from "../components/student/AnnouncementList";
import NotificationList from "../components/student/NotificationList";
import QuickNav from "../components/student/QuickNav";
import {
  DashboardSkeleton,
  ErrorState,
} from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import PriorityBadge from "../components/notifications/PriorityBadge";
import "../styles/student-dashboard.css";

const errorMessage = (e, fallback) => e?.data?.message || fallback;

export default function StudentDashboardPage() {
  usePageSeo(
    {
      title: "Student dashboard | INVYN TECH",
      description: "Your courses, progress and updates.",
      path: ROUTES.studentDashboard,
    },
    [],
  );

  const { data, isLoading, isError, error, refetch } =
    useGetStudentDashboardQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [completeLesson] = useCompleteLessonMutation();
  const [pendingNotification, setPendingNotification] = useState(null);
  const [pendingLesson, setPendingLesson] = useState(null);
  const { toasts, push } = useToasts();

  const onMarkRead = async (id) => {
    setPendingNotification(id);
    try {
      await markRead(id).unwrap();
    } catch (e) {
      push(errorMessage(e, "Could not update the notification."), "error");
    } finally {
      setPendingNotification(null);
    }
  };

  const onCompleteLesson = async (args) => {
    setPendingLesson(
      `${args.courseId}:${args.moduleIndex}:${args.lessonIndex}`,
    );
    try {
      const res = await completeLesson(args).unwrap();
      push(
        res?.data?.course?.status === "completed"
          ? "Course completed. Congratulations!"
          : "Lesson marked as complete.",
      );
    } catch (e) {
      push(errorMessage(e, "Could not save your progress."), "error");
    } finally {
      setPendingLesson(null);
    }
  };

  const unread = data?.notifications?.unreadCount ?? 0;
  const nav = [
    ["Overview", "#overview"],
    ["My courses", "#courses"],
    ["Activity", "#activity"],
    ["Classes", "#sessions"],
    ["Announcements", "#announcements"],
    ["Notifications", "#notifications", unread],
  ];

  return (
    <div className="inv-page">
      <Container>
        <div className="sd">
          <aside className="sd-side" aria-label="Dashboard sections">
            <nav>
              {nav.map(([label, href, count]) => (
                <a key={href} href={href} className="sd-side__link">
                  {label}
                  {count > 0 && (
                    <span className="sd-count" aria-label={`${count} unread`}>
                      {count}
                    </span>
                  )}
                </a>
              ))}
              <Link className="sd-side__link" to={ROUTES.account}>
                My profile
              </Link>
              <Link className="sd-side__link" to={ROUTES.courses}>
                Browse courses
              </Link>
            </nav>
          </aside>

          <main className="sd-main" id="overview">
            {isLoading ? (
              <DashboardSkeleton />
            ) : isError ? (
              <ErrorState
                message={errorMessage(
                  error,
                  "We could not load your dashboard.",
                )}
                onRetry={refetch}
              />
            ) : (
              <div className="sd-stack">
                <ProfileCard profile={data.profile} />
                <QuickNav />
                <section className="sd-stats" aria-label="Learning summary">
                  <StatCard
                    label="Enrolled courses"
                    value={data.stats.totalCourses}
                    hint="Active and completed"
                  />
                  <StatCard
                    label="Ongoing"
                    value={data.stats.ongoingCourses}
                    hint="In progress"
                  />
                  <StatCard
                    label="Completed"
                    value={data.stats.completedCourses}
                    hint="Finished courses"
                  />
                  <StatCard
                    label="Overall progress"
                    value={data.stats.overallProgress}
                    progress={data.stats.overallProgress}
                  />
                </section>
                <MyCourses
                  courses={data.courses}
                  onCompleteLesson={onCompleteLesson}
                  pendingKey={pendingLesson}
                />
                {data.importantUpdates?.length > 0 && (
                  <section
                    className="sd-card sd-section"
                    aria-labelledby="sd-important-h"
                  >
                    <h2 id="sd-important-h">Important updates</h2>

                    <ul className="sd-list">
                      {data.importantUpdates.map((a) => (
                        <li key={a.id}>
                          <p className="sd-timeline__title">
                            {a.title} <PriorityBadge priority={a.priority} />
                          </p>

                          <p className="sd-muted sd-clamp">{a.body}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                <div className="sd-two">
                  <ActivityTimeline items={data.activities} />
                  <SessionList items={data.sessions} />
                </div>
                <div className="sd-two">
                  <AnnouncementList items={data.announcements} />
                  <NotificationList
                    items={data.notifications.items}
                    unreadCount={unread}
                    onMarkRead={onMarkRead}
                    pendingId={pendingNotification}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </Container>
      <Toasts toasts={toasts} />
    </div>
  );
}
