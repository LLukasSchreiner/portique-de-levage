// Repère de nomenclature, comme sur un plan : ligne de rappel depuis la pièce,
// numéro cerclé, puis le nom écrit à la main et une ligne de caractéristiques.
export default function Repere({ piece, P }) {
  const [ax, ay] = P(piece.ancre);
  const [ex, ey] = P(piece.etiquette);
  const droite = (piece.cote ?? 'd') === 'd';
  const s = droite ? 1 : -1;
  const r = 17;
  const coudeX = ex - s * (r + 26);
  const cx = ex;
  const texteX = cx + s * (r + 12);

  return (
    <g className="repere" pointerEvents="none">
      <g>
        <circle className="repere__point" cx={ax} cy={ay} r="3.5" />
        <path
          className="repere__ligne"
          d={`M ${ax} ${ay} L ${coudeX} ${ey} L ${cx - s * r} ${ey}`}
          pathLength="1"
        />
        <circle className="repere__cercle" cx={cx} cy={ey} r={r} pathLength="1" />
      </g>
      <text className="repere__num tech" x={cx} y={ey + 5} textAnchor="middle">
        {piece.repere}
      </text>
      <text className="repere__nom main" x={texteX} y={ey + 2} textAnchor={droite ? 'start' : 'end'}>
        {piece.nom}
      </text>
      {piece.detail && (
        <text className="repere__detail tech" x={texteX} y={ey + 22} textAnchor={droite ? 'start' : 'end'}>
          {piece.detail}
        </text>
      )}
    </g>
  );
}
