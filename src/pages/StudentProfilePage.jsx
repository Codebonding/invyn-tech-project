import { useState } from "react";
import { Link } from "react-router-dom";
import Container from "../components/common/Container";
import usePageSeo from "../hooks/usePageSeo";
import {
  useCreateEducationMutation,
  useDeleteEducationMutation,
  useDeleteStudentAvatarMutation,
  useGetStudentProfileQuery,
  useListStudentEducationQuery,
  useUpdateEducationMutation,
  useUpdateStudentAcademicMutation,
  useUpdateStudentProfileMutation,
  useUploadStudentAvatarMutation,
} from "../services/studentApi";
import { ROUTES } from "../utils/constant";
import { serverMessage } from "../utils/profileValidation";
import ProfileHeader from "../components/student/profile/ProfileHeader";
import PersonalInfoCard from "../components/student/profile/PersonalInfoCard";
import EducationCard from "../components/student/profile/EducationCard";
import AcademicCard from "../components/student/profile/AcademicCard";
import AccountInfoCard from "../components/student/profile/AccountInfoCard";
import { CardSkeleton, ErrorState } from "../components/student/StudentStates";
import { Toasts, useToasts } from "../components/student/Toasts";
import "../styles/student-dashboard.css";
import "../styles/student-profile.css";

export default function StudentProfilePage() {
  usePageSeo({ title: "My profile | INVYN TECH", description: "Manage your student profile.", path: ROUTES.studentProfile }, []);

  const profileQuery = useGetStudentProfileQuery();
  const educationQuery = useListStudentEducationQuery();
  const [updateProfile] = useUpdateStudentProfileMutation();
  const [updateAcademic] = useUpdateStudentAcademicMutation();
  const [uploadAvatar] = useUploadStudentAvatarMutation();
  const [deleteAvatar] = useDeleteStudentAvatarMutation();
  const [createEducation] = useCreateEducationMutation();
  const [updateEducation] = useUpdateEducationMutation();
  const [deleteEducation] = useDeleteEducationMutation();

  const [personalEditing, setPersonalEditing] = useState(false);
  const { toasts, push } = useToasts();

  // Each handler rethrows, so the form that called it can show field-level errors next to the right input.
  const run = (action, success) => async (...args) => {
    try {
      const result = await action(...args).unwrap();
      if (success) push(success);
      return result;
    } catch (err) {
      push(serverMessage(err), "error");
      throw err;
    }
  };

  const onSavePersonal = run((values) => updateProfile(values), "Profile updated.");
  const onSaveAcademic = run((values) => updateAcademic(values), "Academic details updated.");
  const onUploadAvatar = run((file) => uploadAvatar(file), "Profile picture updated.");
  const onRemoveAvatar = run(() => deleteAvatar(), "Profile picture removed.");
  const onCreateEducation = run((values) => createEducation(values), "Qualification added.");
  const onUpdateEducation = run((id, values) => updateEducation({ id, ...values }), "Qualification updated.");
  const onDeleteEducation = run((id) => deleteEducation(id), "Qualification deleted.");

  const editProfile = () => {
    setPersonalEditing(true);
    document.getElementById("personal")?.scrollIntoView?.({ block: "start" });
  };

  const loading = profileQuery.isLoading || educationQuery.isLoading;
  const failed = profileQuery.isError || educationQuery.isError;
  const retry = () => { profileQuery.refetch(); educationQuery.refetch(); };
  const profile = profileQuery.data;

  return (
    <div className="inv-page">
      <Container>
        <div className="sp">
          <nav className="sp-back" aria-label="Breadcrumb">
            <Link to={ROUTES.studentDashboard}>← Back to dashboard</Link>
          </nav>

          {loading ? (
            <div role="status" aria-label="Loading your profile" className="sd-stack">
              <CardSkeleton lines={2} />
              <CardSkeleton lines={5} />
              <CardSkeleton lines={4} />
            </div>
          ) : failed || !profile ? (
            <ErrorState message={serverMessage(profileQuery.error || educationQuery.error, "We could not load your profile.")} onRetry={retry} />
          ) : (
            <div className="sd-stack">
              <ProfileHeader profile={profile} onEditProfile={editProfile} onUploadAvatar={onUploadAvatar} onRemoveAvatar={onRemoveAvatar} />
              <div className="sp-layout">
                <div className="sd-stack">
                  <PersonalInfoCard profile={profile} editing={personalEditing} onEditingChange={setPersonalEditing} onSave={onSavePersonal} />
                  <AcademicCard academic={profile.academic} onSave={onSaveAcademic} />
                </div>
                <div className="sd-stack">
                  <EducationCard
                    items={educationQuery.data?.items || []}
                    onCreate={onCreateEducation}
                    onUpdate={onUpdateEducation}
                    onDelete={onDeleteEducation}
                  />
                  <AccountInfoCard profile={profile} />
                </div>
              </div>
            </div>
          )}
        </div>
      </Container>
      <Toasts toasts={toasts} />
    </div>
  );
}