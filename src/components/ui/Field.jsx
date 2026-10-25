import { useState } from 'react';
import { ChevronDown, Eye, EyeOff } from 'lucide-react';

function Wrapper({ label, error, hint, children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && <label className="field__label">{label}</label>}
      {children}
      {error ? <p className="field__error">{error}</p> : hint && <p className="field__hint">{hint}</p>}
    </div>
  );
}

export function Input({ label, error, hint, ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <input className="field__control" {...props} />
    </Wrapper>
  );
}

export function Textarea({ label, error, hint, ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <textarea className="field__control" {...props} />
    </Wrapper>
  );
}

export function Select({ label, error, hint, options = [], placeholder, ...props }) {
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <div className="select-wrap">
        <select className="field__control" {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
        <ChevronDown size={16} />
      </div>
    </Wrapper>
  );
}

export function PasswordInput({ label, error, hint, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <Wrapper label={label} error={error} hint={hint}>
      <div className="field__control field__control--inner">
        <input type={show ? 'text' : 'password'} {...props} />
        <button type="button" className="toast__close" onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>
          {show ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      </div>
    </Wrapper>
  );
}
