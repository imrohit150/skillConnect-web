import RequestsView from "@/components/requests-view";

// The client auth layout may withhold this page while it checks the session.
export const instant = false;

export default function RequestsPage() {
  return <RequestsView />;
}
