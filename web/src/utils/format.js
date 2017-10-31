export default function f (x, withDecimals = 2) {
  x = x.toFixed(withDecimals);
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
