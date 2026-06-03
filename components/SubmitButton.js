'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, className = '', pendingText = 'Saving...' }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? pendingText : children}
    </button>
  );
}
