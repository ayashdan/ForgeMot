import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p className="text-lg font-semibold">Page not found</p>
      <Link to="/dashboard" className="text-sm font-medium text-brand hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}
