import { useState } from "react";

export default function ConfirmButton({ onConfirm, confirmText, pendingText, className, children }) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirm(confirmText)) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  }

  return (
    <button onClick={handleClick} disabled={pending} className={className}>
      {pending ? pendingText : children}
    </button>
  );
}
