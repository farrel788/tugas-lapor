export default function Card({ title, children, className = '' }) {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="t-sub">{title}</h3>}
      {children}
    </section>
  );
}
