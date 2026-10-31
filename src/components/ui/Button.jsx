import { Loader2 } from 'lucide-react';

export default function Button({
  variant = 'primary', block = false, loading = false, icon: Icon, children, className = '', ...props
}) {
  const cls = `btn btn--${variant} ${block ? 'btn--block' : ''} ${className}`;
  return (
    <button className={cls} disabled={props.disabled || loading} {...props}>
      {loading ? <Loader2 size={20} className="spin" /> : Icon && <Icon size={20} />}
      {children}
    </button>
  );
}
