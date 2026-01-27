import "./styles.css";

export default function HelloWidget() {
  return (
    <div className="hello-widget">
      <span className="hello-text" aria-live="polite">
        Hello World
      </span>
    </div>
  );
}
