export default function Skeleton({ height = 24, width = '100%', style }) {
  return <div className="skeleton" style={{ height, width, ...style }} aria-hidden="true" />;
}
