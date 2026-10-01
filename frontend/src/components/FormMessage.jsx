export default function FormMessage({ message, details }) {
  if (!message && !details) return null;
  return <div className="form-message"><p>{message}</p>{details && <ul>{Object.values(details).map(detail => <li key={detail}>{detail}</li>)}</ul>}</div>;
}
