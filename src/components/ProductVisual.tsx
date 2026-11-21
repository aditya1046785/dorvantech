export function ProductVisual({
  kind = "foundation",
}: {
  kind?: "foundation" | "beats" | "career";
}) {
  return (
    <div
      className={`product-visual visual-${kind}`}
      role="img"
      aria-label={`${kind === "foundation" ? "Connected foundation dashboard" : kind === "beats" ? "GitHub projects becoming a resume" : "Job discovery and relevance filtering"} — conceptual interface illustration`}
    >
      <div className="mini-app">
        <div className="mini-toolbar">
          <span className="mini-symbol">
            {kind === "foundation" ? "N" : kind === "beats" ? "B" : "A"}
          </span>
          <span>
            {kind === "foundation"
              ? "Foundation workspace"
              : kind === "beats"
                ? "Your work. Your story."
                : "Career workspace"}
          </span>
          <span className="mini-toolbar-end">•••</span>
        </div>
        <div className="mini-content">
          <div className="mini-sidebar">
            <i />
            <i />
            <i />
            <i />
          </div>
          <div className="mini-main">
            <div className="mini-heading">
              {kind === "foundation"
                ? "Everything, connected."
                : kind === "beats"
                  ? "Built from your GitHub."
                  : "Find your next chapter."}
            </div>
            {kind === "foundation" ? (
              <>
                <div className="mini-stats">
                  <div>
                    Members<b>People</b>
                  </div>
                  <div>
                    Content<b>Stories</b>
                  </div>
                  <div>
                    Payments<b>Support</b>
                  </div>
                </div>
                <div className="mini-chart">
                  {[32, 55, 42, 72, 60, 85, 74, 95, 88, 110].map((h, i) => (
                    <i key={i} style={{ height: h }} />
                  ))}
                </div>
              </>
            ) : kind === "beats" ? (
              <div className="resume-flow">
                <div className="code-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <span>Projects & activity</span>
                </div>
                <div className="resume-sheet">
                  <b>Your resume</b>
                  <i />
                  <i />
                  <hr />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            ) : (
              <div className="job-list">
                {[
                  "Discover opportunities",
                  "Filter to your preferences",
                  "Evaluate the fit",
                ].map((label, i) => (
                  <div key={label}>
                    <span className="job-icon">{["⌘", "≡", "✦"][i]}</span>
                    <span>
                      {label}
                      <i />
                    </span>
                    <b>{["Discover", "Filter", "Review"][i]}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <span className="illustration-label">
        Conceptual interface · Created with code
      </span>
    </div>
  );
}
