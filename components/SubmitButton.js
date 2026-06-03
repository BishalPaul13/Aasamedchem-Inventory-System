'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton({ children, className = '' }) {
  const { pending } = useFormStatus();
  return (
    <button className={className} disabled={pending} type="submit">
      {pending ? 'Saving...' : children}
    </button>
  );
}
