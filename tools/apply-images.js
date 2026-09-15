/* AYN CASA - one-off tool: wires the downloaded photos in assets/ into js/data.js.
 * Adds  images: ['assets/...jpg', ...]  to each product and project by slug.
 * Safe to re-run: it replaces an existing images array for that slug.
 *
 *   node tools/apply-images.js            (writes js/data.js)
 *   node tools/apply-images.js --dry      (prints what it would do)
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');
const dataFile = path.join(root, 'js', 'data.js');
const dry = process.argv.includes('--dry');

/* slug -> candidate asset base names, in the order they should appear */
const MAP = {
  /* products */
  'sereno-console': ['sereno-console-1', 'sereno-console-2'],
  'rialto-dining-table': ['rialto-table-1', 'rialto-table-2'],
  'norina-armchair': ['norina-armchair-1', 'norina-armchair-2'],
  'cadenza-sideboard': ['cadenza-sideboard-1', 'cadenza-sideboard-2'],
  'linea-bookcase': ['linea-bookcase-1', 'linea-bookcase-2'],
  'sospiro-pendant': ['sospiro-pendant-1', 'sospiro-pendant-2'],
  'bruma-table-lamp': ['bruma-lamp-1', 'bruma-lamp-2'],
  'orizzonte-rug': ['orizzonte-rug-1', 'orizzonte-rug-2'],
  'filigrana-rug': ['filigrana-rug-1'],
  'veneto-dinner-set': ['veneto-plates-1'],
  'fiore-glassware': ['fiore-glassware-1'],
  'astro-cutlery': ['astro-cutlery-1'],
  'aura-wool-plaid': ['aura-plaid-1'],
  'teodora-cushion': ['teodora-cushion-1'],
  'petra-bath-linens': ['petra-towels-1'],
  'pegaso-candle': ['pegaso-candle-1'],
  'vivid-dragonflies': ['vivid-objects-1'],
  'hunter-globe': ['hunter-globe-1'],
  /* projects */
  'worli-sea-facing': ['project-worli-1', 'project-worli-2'],
  'golf-links-villa': ['project-golf-links-1', 'project-golf-links-2'],
  'jubilee-hills-residence': ['project-jubilee-1', 'project-jubilee-2'],
  'sadashivanagar-penthouse': ['project-penthouse-1', 'project-penthouse-2'],
  'kalyani-nagar-3bhk': ['project-kalyani-1', 'project-kalyani-2'],
  'boat-club-apartment': ['project-boatclub-1', 'project-boatclub-2']
};

let source = fs.readFileSync(dataFile, 'utf8');
let wired = 0, missing = 0, notFound = 0;
const missingList = [];

Object.keys(MAP).forEach((slug) => {
  const files = MAP[slug]
    .map((base) => ({ base, file: base + '.jpg' }))
    .filter((entry) => {
      if (fs.existsSync(path.join(assetsDir, entry.file))) { return true; }
      missingList.push(entry.file);
      return false;
    });

  if (!files.length) { missing++; return; }

  const list = files.map((f) => "'assets/" + f.file + "'").join(', ');
  const version = "'?v=" + Date.now().toString().slice(0, 7) + "'";

  /* replace an existing images array for this slug, else insert one after "slug: 'x'," */
  const existing = new RegExp("(slug: '" + slug + "',\\s*)images: \\[[^\\]]*\\],\\s*");
  if (existing.test(source)) {
    source = source.replace(existing, "$1images: [" + list + "], ");
    wired++;
    return;
  }
  const anchor = "slug: '" + slug + "',";
  if (source.indexOf(anchor) === -1) { notFound++; return; }
  source = source.replace(anchor, anchor + ' images: [' + list + '],');
  wired++;
  void version;
});

if (!dry) { fs.writeFileSync(dataFile, source, 'utf8'); }

console.log((dry ? '[dry run] ' : '') + 'wired ' + wired + ' entries into js/data.js');
if (notFound) { console.log('slug not found in data.js: ' + notFound); }
if (missingList.length) {
  console.log('assets not present yet (skipped): ' + missingList.length);
  console.log('  ' + missingList.join(', '));
}
