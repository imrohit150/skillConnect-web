import MessagesView from "@/components/messages-view";

// The client-side auth gate can withhold this page while it checks the session.
// Allow this route to wait rather than validating a page that was not rendered.
export const instant = false;

export default function MessagesPage() {
  return <MessagesView />;
}
