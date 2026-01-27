import "./styles.css";

export default function HelloWidget() {
  return (
    <div className="hello-widget">
      <div className="magic-card" role="presentation">
        <div className="magic-orbit">
          <div className="orbit orbit-one">
            <span className="orbit-dot" />
          </div>
          <div className="orbit orbit-two">
            <span className="orbit-dot" />
          </div>
          <div className="orbit orbit-three">
            <span className="orbit-dot" />
          </div>
          <div className="core-glow" />
        </div>
        <div className="magic-text">
          <span className="magic-gradient-text" aria-live="polite">
            Hello World, Magic UI vibes!
          </span>
          <span className="magic-subtitle">Magic UI vibes, powered up.</span>
        </div>
      </div>
    </div>
  );
}
