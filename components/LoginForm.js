'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import SubmitButton from './SubmitButton';

export default function LoginForm() {
  const [state, action] = useActionState(loginAction, {});

  return (
    <form action={action} className="panel stack">
      <label>
        Email
        <input name="email" type="email" defaultValue="seller@example.com" required />
      </label>
      <label>
        Password
        <input name="password" type="password" defaultValue="Seller@12345" required />
      </label>
      {state?.error ? <p className="error">{state.error}</p> : null}
      <SubmitButton>Log in</SubmitButton>
      <p className="muted small">Admin: admin@example.com / Admin@12345</p>
      <p className="muted small">Seller: seller@example.com / Seller@12345</p>
    </form>
  );
}
