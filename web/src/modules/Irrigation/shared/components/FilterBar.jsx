/**
 * Search / filter controls and page actions. Inside the page toolbar the two
 * groups join the toolbar's single row (filters left, actions far right).
 */
export default function FilterBar({ filters, actions }) {
  return (
    <div className="irr-filterbar">
      <div className="irr-filterbar-filters">{filters}</div>
      <div className="irr-filterbar-actions">{actions}</div>
    </div>
  );
}
