import ResourceBookingsShell from "../ResourceBookingsShell.jsx";

/** Student-facing booking shell: meeting rooms + library workspaces to book; My bookings shows all of your rows. */
export default function StudentBookingsShell(props) {
  return <ResourceBookingsShell audience="student" {...props} />;
}
