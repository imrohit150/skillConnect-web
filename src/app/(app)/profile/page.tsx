import ProfileView from "@/components/profile-view";

// The client auth layout may withhold this page while it checks the session.
export const instant = false;

export default function ProfilePage() {
  return <ProfileView />;
}
