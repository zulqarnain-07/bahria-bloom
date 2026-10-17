/* Bahria Bloom: recolours the dashboard's Chart.js attendance chart.
   Runs in the page's own JS world (manifest: "world": "MAIN") so it can reach the Chart global.
   Present = periwinkle (darkened so the white % labels stay readable), Absent = blossom. */
(function () {
  'use strict';
  var PLUM = '#250e2c';
  var tries = 0;

  function apply() {
    var canvas = document.getElementById('attendanceSummaryCanvas');
    if (!canvas) return true;                       // not the dashboard: nothing to do
    if (!window.Chart || typeof Chart.getChart !== 'function') return false;
    var chart = Chart.getChart(canvas);
    if (!chart) return false;
    try {
      var family = '"Nunito", "Trebuchet MS", "Segoe UI", system-ui, sans-serif';
      Chart.defaults.font.family = family;
      Chart.defaults.color = PLUM;

      var present = chart.data.datasets[0], absent = chart.data.datasets[1];
      if (present) { present.backgroundColor = '#6f64a3'; present.borderColor = PLUM; present.borderWidth = 1.5; present.borderRadius = 4; }
      if (absent)  { absent.backgroundColor = '#f6a5c0'; absent.borderColor = PLUM; absent.borderWidth = 1.5; absent.borderRadius = 4; }

      var o = chart.options, sc = o.scales || {};
      if (sc.x) { sc.x.grid = sc.x.grid || {}; sc.x.grid.color = 'rgba(37,14,44,.12)'; sc.x.ticks = sc.x.ticks || {}; sc.x.ticks.color = PLUM; if (sc.x.title) sc.x.title.color = PLUM; }
      if (sc.y) { sc.y.grid = sc.y.grid || {}; sc.y.grid.display = false; sc.y.ticks = sc.y.ticks || {}; sc.y.ticks.color = PLUM; sc.y.ticks.font = { size: 11, weight: '700', family: family }; }
      var pl = o.plugins = o.plugins || {};
      if (pl.legend && pl.legend.labels) { pl.legend.labels.color = PLUM; pl.legend.labels.font = { size: 12, weight: '700', family: family }; }
      pl.tooltip = pl.tooltip || {};
      pl.tooltip.backgroundColor = PLUM; pl.tooltip.titleColor = '#f7c2ca'; pl.tooltip.bodyColor = '#fff8f9';
      pl.tooltip.cornerRadius = 10; pl.tooltip.padding = 10;
      chart.update('none');
      return true;
    } catch (e) { return true; }
  }

  function poll() {
    if (apply() || ++tries > 40) return;
    setTimeout(poll, 200);
  }
  poll();
})();
