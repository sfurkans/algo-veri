import { useState, useMemo } from "react";

export default function useBigO() {
  const [n, setN] = useState(10);

  const values = useMemo(() => {
    const o1 = 1;
    const ologn = Math.log2(n) || 0;
    const on = n;
    const onlogn = n * (Math.log2(n) || 0);
    const on2 = n * n;
    const o2n = Math.min(Math.pow(2, n), 1073741824); // cap at 2^30

    const max = Math.max(o1, ologn, on, onlogn, on2, o2n);

    function pct(v) {
      if (max === 0) return 0;
      // sqrt scaling so large values don't compress small ones to zero
      return Math.min(100, (Math.sqrt(v) / Math.sqrt(max)) * 100);
    }

    return [
      { key: "O1",     label: "O(1)",        value: o1,    pct: pct(o1),    color: "emerald" },
      { key: "OlogN",  label: "O(log n)",    value: Math.round(ologn * 10) / 10, pct: pct(ologn), color: "sky" },
      { key: "ON",     label: "O(n)",        value: on,    pct: pct(on),    color: "amber" },
      { key: "ONlogN", label: "O(n log n)",  value: Math.round(onlogn * 10) / 10, pct: pct(onlogn), color: "violet" },
      { key: "ON2",    label: "O(n²)",       value: on2,   pct: pct(on2),   color: "orange" },
      { key: "O2N",    label: "O(2ⁿ)",       value: o2n > 1000000 ? ">1M" : o2n, pct: pct(o2n), color: "rose" },
    ];
  }, [n]);

  return { n, setN, values };
}
