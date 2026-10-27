import ConnectionsView from "@/components/connections-view";

// The client-side session gate can withhold this page during navigation validation.
export const instant = false;

export default function ConnectionsPage() {
  return <ConnectionsView />;
}
