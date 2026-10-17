Bahria Bloom - blossom redesign for cms.bahria.edu.pk and lms.bahria.edu.pk

Install (Chrome, Edge, Brave; Chrome 111 or newer)
1. Unzip this folder (replace the old bahria-bloom folder if you have one).
2. Open chrome://extensions and switch on Developer mode.
3. Click "Load unpacked" and choose the unzipped bahria-bloom folder.
   (Already installed? Click the reload arrow on the Bahria Bloom card instead.)
4. Open https://cms.bahria.edu.pk/ or https://lms.bahria.edu.pk/Student/Dashboard.php and reload.

Files
theme.css       shared: colours, type, buttons, forms, tables (palette tokens are at the top). CMS + LMS
lms.css         LMS only: re-skins the AdminLTE header, side menu, boxes, labels, alerts, footer
blossom.js      petal shower, click bursts, the small petal on/off button. CMS + LMS
content.js      builds the door illustration, portal icons and dashboard greeting. CMS + LMS
chart-theme.js  recolours the CMS attendance chart
manifest.json   applies everything to the two sites

Petals respect "reduce motion" in your OS, and the round button in the
bottom-right corner turns them off (remembered between visits).
