export type CmLineChartCurve = "linear" | "smooth";

type ChartPoint = { x: number; y: number };

/** Both curves pass through every observation; the controls stay between adjacent values. */
export function chartLinePath(points: readonly ChartPoint[], curve: CmLineChartCurve) {
  const first = points[0];
  if (!first) return "";
  let path = `M${first.x} ${first.y}`;
  if (points.length === 1) return `${path}l0 0`;
  for (let index = 1; index < points.length; index++) {
    const previous = points[index - 1];
    const point = points[index];
    if (curve === "linear") {
      path += ` L${point.x} ${point.y}`;
    } else {
      const middle = (previous.x + point.x) / 2;
      path += ` C${middle} ${previous.y}, ${middle} ${point.y}, ${point.x} ${point.y}`;
    }
  }
  return path;
}
