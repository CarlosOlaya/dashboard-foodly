// ── Brand tokens (keep in sync with _variables.css :root) ──
export const BRAND = {
    primary: '#06f9f9',
    secondary: '#0d9488',
    teal: '#14b8a6',
    cyan: '#22d3ee',
    sky: '#38bdf8',
    lightCyan: '#67e8f9',
    paleCyan: '#a5f3fc',
    amber: '#f59e0b',
    purple: '#8b5cf6',
    rose: '#f43f5e',
    indigo: '#6366f1',
    blue: '#0ea5e9',
} as const;

// ── ngx-charts color schemes ──
export const CHART_COLORS = {
    /** Gradient line/area charts — cool cyan tones */
    line: {
        name: 'foodlyLine', selectable: true, group: 'ordinal' as const,
        domain: [BRAND.primary, BRAND.secondary, BRAND.teal, BRAND.cyan, BRAND.sky, BRAND.lightCyan, BRAND.paleCyan],
    },
    /** Pie/donut charts — diverse palette for categories */
    pie: {
        name: 'foodlyPie', selectable: true, group: 'ordinal' as const,
        domain: [BRAND.primary, BRAND.teal, BRAND.amber, BRAND.purple, BRAND.rose, BRAND.indigo, BRAND.blue, BRAND.cyan],
    },
    /** Single-color bar charts */
    bar: {
        name: 'foodlyBar', selectable: true, group: 'ordinal' as const,
        domain: [BRAND.teal],
    },
};
