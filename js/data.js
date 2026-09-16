/* AYN CASA - the entire data layer of this single-page website.
 * No server, no database: every section reads window.AYN.data.
 * Edit the literals below to change the site content; no build step needed.
 */
window.AYN = window.AYN || {};

window.AYN.data = {
  brand: {
    name: 'AYN CASA',
    legal: 'AYN Casa Interior Design Studio',
    tagline: 'Interior Design | Turning Houses into Homes',
    promise: 'Creating Spaces That Inspire',
    blurb: 'Contact for space planning, 3D views and interior solutions.',
    phone: '8879404352',
    phoneDisplay: '+91 88794 04352',
    whatsapp: '918879404352',      // country code + number, digits only (wa.me)
    email: 'contact@ayncasa.com',
    instagram: 'https://www.instagram.com/ayn_casa/',
    hours: 'Mon - Sat, 10:00 - 19:00',
    serviceArea: 'On-site across India, remote 3D work worldwide',
    currency: 'INR',
    locale: 'en-IN'
  },

  stats: [
    { value: '15+', label: 'Years designing interiors' },
    { value: '240', label: 'Homes delivered' },
    { value: '12', label: 'Cities served' },
    { value: '48h', label: 'For a first layout idea' }
  ],

  highlights: [
    'Space planning', '3D views', 'Interior solutions', 'Turnkey execution',
    'Modular kitchens', 'False ceiling and lighting', 'Bespoke furniture', 'Site supervision'
  ],

  spaces: [
    { src: 'assets/studio-living.jpg', title: 'Living room',
      text: 'The room everything else is planned around. We fix the seating, the light and the sightlines first, then layer materials so it works for a quiet evening and a full house alike.' },
    { src: 'assets/studio-kitchen.jpg', title: 'Kitchen',
      text: 'Designed around how you actually cook. Work triangle, storage within reach, and finishes picked to survive daily use - not just for the photos.' },
    { src: 'assets/studio-bedroom.jpg', title: 'Bedroom',
      text: 'Quiet by design. Layered lighting, blackout options and storage that hides the clutter, so the room stays calm however loud the day was.' },
    { src: 'assets/studio-dining.jpg', title: 'Dining',
      text: 'Sized to your family and your guests. Lighting that dims for dinner, surfaces that age well, and a table that earns its place in the room.' }
  ],

  services: [
    {
      id: 'space-planning', title: 'Space planning', image: 'assets/svc-space-planning.jpg',
      copy: 'We rework how the room flows before anything is bought: circulation, storage, furniture sizes and the placement of every switch and socket.',
      points: ['Measured site survey', 'Two or three layout options', 'Furniture size and clearance check']
    },
    {
      id: '3d-views', title: '3D views and visualisation', image: 'assets/contact-3d.jpg',
      copy: 'Photo-real 3D views of each room in your own material and colour selections, so you approve the look before execution starts.',
      points: ['Room-wise 3D views', 'Two material revisions', 'Walkthrough video on request']
    },
    {
      id: 'interior-solutions', title: 'Interior solutions', image: 'assets/project-jubilee-1.jpg',
      copy: 'One point of contact from demolition to handover: civil work, electricals, carpentry, polish, furnishing and styling. Weekly site updates.',
      points: ['Fixed quote, itemised', 'Vendor and labour management', 'Snag list closed before handover']
    },
    {
      id: 'modular', title: 'Modular and bespoke furniture', image: 'assets/studio-kitchen.jpg',
      copy: 'Kitchens, wardrobes, TV units, study tables and beds, built to your sizes in the finishes you choose, at our own workshop.',
      points: ['BWP plywood and hardware options', 'Soft-close and anti-scratch finishes', 'Factory finish, site assembled']
    },
    {
      id: 'false-ceiling', title: 'False ceiling and lighting', image: 'assets/sospiro-pendant-1.jpg',
      copy: 'Ceiling and lighting schemes designed together: cove and profile lights, spots where they are actually needed, separate day and evening circuits.',
      points: ['POP or gypsum options', 'Lighting layouts per room', 'Dimmer and scene planning']
    },
    {
      id: 'styling', title: 'Furnishing and styling', image: 'assets/aura-plaid-1.jpg',
      copy: 'Sofas, rugs, curtains, art and accessories chosen to finish the space and photographed before we hand over the keys.',
      points: ['Curtain and blind measurement', 'Rug and upholstery selection', 'Handover styling and photos']
    }
  ],

  categories: [
    { id: 'furniture', name: 'Furniture' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'rugs', name: 'Rugs' },
    { id: 'tableware', name: 'Tableware' },
    { id: 'textiles', name: 'Textiles' },
    { id: 'lifestyle', name: 'Lifestyle' }
  ],

  /* Products are shown as a catalogue: nothing is sold online. Add a number to
     "price" on any item and the card shows it; leave it null for "Price on request". */
  products: [
    {
      slug: 'sereno-console', images: ['assets/sereno-console-1.jpg', 'assets/sereno-console-2.jpg'], name: 'Sereno Console', line: 'Origins', category: 'furniture',
      price: null, colours: ['Walnut', 'Eucalyptus'], lead: '6-8 weeks', badge: 'Made to order',
      material: 'Canaletto walnut, brushed brass base', size: 'W 180 x D 45 x H 78 cm',
      description: 'A long, low console with a continuous grain top and a slim brass plinth - it anchors a living or dining wall without adding visual weight.',
      details: ['Hand-finished veneer', 'Adjustable levellers', 'Sized to your wall on request']
    },
    {
      slug: 'rialto-dining-table', images: ['assets/rialto-table-1.jpg', 'assets/rialto-table-2.jpg'], name: 'Rialto Dining Table', line: 'Origins', category: 'furniture',
      price: null, colours: ['Smoke Oak', 'Panna'], lead: '6-8 weeks',
      material: 'Solid oak top, lacquered base', size: 'L 240 x W 110 x H 75 cm',
      description: 'Seats eight. The top is built from narrow staves so the grain reads like a woven surface under evening light.',
      details: ['Seats 8 comfortably', 'Two lacquer tones', 'Also made in 6-seater size']
    },
    {
      slug: 'norina-armchair', images: ['assets/norina-armchair-1.jpg', 'assets/norina-armchair-2.jpg'], name: 'Norina Armchair', line: 'Living', category: 'furniture',
      price: null, colours: ['Ivory Boucle', 'Slate Velvet'], lead: '5-7 weeks',
      material: 'Beech frame, boucle upholstery', size: 'W 82 x D 88 x H 74 cm',
      description: 'A rounded shell on a recessed base, with a seat depth tuned for long conversations.',
      details: ['Contract-grade foam', 'Removable covers', 'Fabric or leatherette']
    },
    {
      slug: 'cadenza-sideboard', images: ['assets/cadenza-sideboard-1.jpg', 'assets/cadenza-sideboard-2.jpg'], name: 'Cadenza Sideboard', line: 'Living', category: 'furniture',
      price: null, colours: ['Ebony', 'Panna'], lead: '5-7 weeks',
      material: 'Lacquered wood, bronze handles', size: 'W 220 x D 50 x H 72 cm',
      description: 'Four soft-close doors with a shadow-line reveal that keeps the front elevation flat and calm.',
      details: ['Soft-close hinges', 'Cable cut-outs for media', 'Interior shelves in satin finish']
    },
    {
      slug: 'linea-bookcase', images: ['assets/linea-bookcase-1.jpg', 'assets/linea-bookcase-2.jpg'], name: 'Linea Bookcase', line: 'Living', category: 'furniture',
      price: null, colours: ['Charcoal', 'Ivory'], lead: '4-6 weeks',
      material: 'Steel frame, lacquered shelves', size: 'W 150 x D 34 x H 210 cm',
      description: 'An open grid that reads as architecture rather than storage. Wall fixed or freestanding.',
      details: ['Open or rear-panelled', 'Wall fixing included', 'Shelf load 25 kg']
    },
    {
      slug: 'sospiro-pendant', images: ['assets/sospiro-pendant-1.jpg', 'assets/sospiro-pendant-2.jpg'], name: 'Sospiro Pendant', line: 'Light', category: 'lighting',
      price: null, colours: ['Brass', 'Nickel'], lead: '3-4 weeks',
      material: 'Blown glass, brass canopy', size: 'Dia 45 x H 32 cm',
      description: 'A hand-blown diffuser that softens its source into a low, even pool of light over dining tables.',
      details: ['Dimmable, trailing edge', 'Drop adjustable to 2 m', 'Warm or neutral LED']
    },
    {
      slug: 'bruma-table-lamp', images: ['assets/bruma-lamp-1.jpg', 'assets/bruma-lamp-2.jpg'], name: 'Bruma Table Lamp', line: 'Light', category: 'lighting',
      price: null, colours: ['Ivory', 'Terracotta'], lead: '2-3 weeks',
      material: 'Ceramic body, linen shade', size: 'Dia 34 x H 52 cm',
      description: 'Glazed ceramic turned by hand; the linen shade is available in three grades of openness.',
      details: ['In-line switch', 'E27 fitting, bulb not included', 'Handmade, slight variation expected']
    },
    {
      slug: 'orizzonte-rug', images: ['assets/orizzonte-rug-1.jpg', 'assets/orizzonte-rug-2.jpg'], name: 'Orizzonte Rug', line: 'Textures', category: 'rugs',
      price: null, colours: ['Sand', 'Graphite'], lead: '6-8 weeks',
      material: '60% wool, 40% silk', size: '300 x 400 cm',
      description: 'A panoramic fade woven in silk and wool, dense enough to hold a room together on its own.',
      details: ['Hand-knotted', 'Bespoke sizes to 600 x 900 cm', 'Anti-slip underlay supplied']
    },
    {
      slug: 'filigrana-rug', images: ['assets/filigrana-rug-1.jpg'], name: 'Filigrana Rug', line: 'Textures', category: 'rugs',
      price: null, colours: ['Pearl', 'Ink'], lead: '5-7 weeks',
      material: '100% Tibetan wool', size: '250 x 350 cm',
      description: 'A fine macro-pattern that disappears into tone-on-tone finishes and returns under raking light.',
      details: ['Hand-tufted', 'Custom borders available', 'Made to your room size']
    },
    {
      slug: 'veneto-dinner-set', images: ['assets/veneto-plates-1.jpg'], name: 'Veneto Dinner Set', line: 'Table', category: 'tableware',
      price: null, colours: ['Bianco', 'Grigio'], lead: 'In stock',
      material: 'Fine porcelain', size: 'Dia 27 cm, set of 6',
      description: 'A wide rim and a shallow well, stackable and dishwasher safe - daily china that still looks dressed for guests.',
      details: ['Set of 6', 'Microwave safe', 'Open stock available']
    },
    {
      slug: 'fiore-glassware', images: ['assets/fiore-glassware-1.jpg'], name: 'Fiore Glassware', line: 'Table', category: 'tableware',
      price: null, colours: ['Clear', 'Smoke'], lead: 'In stock',
      material: 'Mouth-blown crystal', size: 'H 22 cm, 320 ml, set of 6',
      description: 'A thin tulip bowl with a pulled stem - delicate in the hand, stable on the table.',
      details: ['Set of 6', 'Dishwasher safe on glass cycle', 'Lead free crystal']
    },
    {
      slug: 'astro-cutlery', images: ['assets/astro-cutlery-1.jpg'], name: 'Astro Cutlery', line: 'Table', category: 'tableware',
      price: null, colours: ['Gold', 'Steel'], lead: '2-3 weeks',
      material: '18/10 steel, 24 kt coating', size: '5 piece place setting',
      description: 'Balanced weight with a mirror finish; the brass tone is applied in a 24 karat wash.',
      details: ['Dishwasher safe, low heat', 'Also sold in sets of 6 covers', 'Gift boxed']
    },
    {
      slug: 'aura-wool-plaid', images: ['assets/aura-plaid-1.jpg'], name: 'Aura Wool Plaid', line: 'Textiles', category: 'textiles',
      price: null, colours: ['Grey', 'Multicolour'], lead: '2-3 weeks',
      material: 'Triple jacquard wool', size: '150 x 200 cm',
      description: 'A dense jacquard that reads plain at a distance and patterned up close, finished with twisted fringes.',
      details: ['100% wool', 'Dry clean', 'Gift boxed']
    },
    {
      slug: 'teodora-cushion', images: ['assets/teodora-cushion-1.jpg'], name: 'Teodora Cushion', line: 'Textiles', category: 'textiles',
      price: null, colours: ['Beige', 'Red'], lead: 'In stock',
      material: 'Silk blend front, cotton reverse', size: '50 x 50 cm',
      description: 'A quiet accent cushion that carries a room palette across the sofa.',
      details: ['Filled pad included', 'Hidden zip', 'Dry clean']
    },
    {
      slug: 'petra-bath-linens', images: ['assets/petra-towels-1.jpg'], name: 'Petra Bath Linens', line: 'Bath', category: 'textiles',
      price: null, colours: ['White', 'Grey'], lead: 'In stock',
      material: 'Egyptian cotton, 700 gsm', size: 'Set of 3 (bath, hand, face)',
      description: 'A heavy, low-twist terry that stays soft through repeated laundering.',
      details: ['Machine wash 40C', 'Ribbed border', 'Refills available by piece']
    },
    {
      slug: 'pegaso-candle', images: ['assets/pegaso-candle-1.jpg'], name: 'Pegaso Scented Candle', line: 'Atmosphere', category: 'lifestyle',
      price: null, colours: ['Gold', 'Silver', 'Green'], lead: 'In stock',
      material: 'Vegetable wax, glass vessel', size: '700 g, approx. 90 hours',
      description: 'Amber, cedar and a dry mineral note. The vessel is designed to be reused as a small holder.',
      details: ['90 hour burn time', 'Cotton wick', 'Refills available']
    },
    {
      slug: 'vivid-dragonflies', images: ['assets/vivid-objects-1.jpg'], name: 'Vivid Dragonflies', line: 'Atmosphere', category: 'lifestyle',
      price: null, colours: ['Silver'], lead: 'In stock',
      material: 'Cast metal, silver plate', size: 'Set of 2',
      description: 'Two small table sculptures, weighted so they sit flat on books and shelves.',
      details: ['Felt base', 'Set of 2', 'Gift boxed']
    },
    {
      slug: 'hunter-globe', images: ['assets/hunter-globe-1.jpg'], name: 'Hunter Globe', line: 'Atmosphere', category: 'lifestyle',
      price: null, colours: ['Light blue'], lead: '2-3 weeks',
      material: 'Methacrylate base, printed paper', size: 'Dia 30 cm',
      description: 'A pale, low-contrast globe on a clear base - a desk object that does not shout.',
      details: ['Hand applied print', 'Methacrylate stand', 'Gift boxed']
    }
  ],

  projects: [
    { slug: 'worli-sea-facing', images: ['assets/project-golf-links-2.jpg', 'assets/project-worli-2.jpg'], title: 'Worli Sea-Facing Apartment', city: 'Mumbai', year: '2025', scope: 'Full interior design and execution, 3,200 sq ft', description: 'A four bedroom apartment replanned around the sea view: one pale material palette, deep sofas and a low, uninterrupted line of cabinetry along the western wall.' },
    { slug: 'golf-links-villa', images: ['assets/project-golf-links-1.jpg', 'assets/project-golf-links-2.jpg'], title: 'Golf Links Villa', city: 'New Delhi', year: '2025', scope: 'Complete renovation, 6,800 sq ft', description: 'A 1970s villa opened up internally. The restored terrazzo floors set the palette: brass, walnut and hand-knotted wool.' },
    { slug: 'jubilee-hills-residence', images: ['assets/project-jubilee-1.jpg', 'assets/project-jubilee-2.jpg'], title: 'Jubilee Hills Residence', city: 'Hyderabad', year: '2024', scope: 'Interior design and furnishing, 5,100 sq ft', description: 'Interiors for a family of five, organised around a double-height central hall and a semi-open kitchen with a marble island.' },
    { slug: 'sadashivanagar-penthouse', images: ['assets/project-penthouse-1.jpg'], title: 'Sadashivanagar Penthouse', city: 'Bengaluru', year: '2024', scope: 'Interiors, lighting and furnishing, 4,400 sq ft', description: 'A dark, quiet penthouse: charcoal lacquer, bronze, and a lighting scheme of four dimmed circuits for day and evening scenes.' },
    { slug: 'kalyani-nagar-3bhk', images: ['assets/project-kalyani-1.jpg', 'assets/project-kalyani-2.jpg'], title: 'Kalyani Nagar 3BHK', city: 'Pune', year: '2023', scope: 'Space planning and modular work, 1,650 sq ft', description: 'A compact flat for a young couple: wall-to-wall joinery that doubles as storage, and a kitchen opened to the dining area.' },
    { slug: 'boat-club-apartment', images: ['assets/project-boatclub-1.jpg', 'assets/project-boatclub-2.jpg'], title: 'Boat Club Apartment', city: 'Chennai', year: '2023', scope: 'Space planning and 3D visualisation, 2,100 sq ft', description: 'A tired 1990s flat redrawn with a single circulation spine, so every room keeps its own light and the corridor disappears.' }
  ],

  testimonials: [
    { quote: 'They redrew our entire ground floor and the house suddenly made sense. The 3D views matched the finished rooms almost exactly.', name: 'Ritu and Amit', place: '3BHK, Mumbai' },
    { quote: 'One team handled the drawings, the carpentry and the site. We were shown photos every week and never had to chase anyone.', name: 'Sandeep K.', place: 'Villa, Hyderabad' },
    { quote: 'Budget was fixed upfront and stayed fixed. The kitchen and wardrobes are still perfect three years on.', name: 'Farida S.', place: 'Apartment, Bengaluru' },
    { quote: 'They understood how we wanted to live, not just how we wanted the rooms to look. The final home feels warm, practical and completely ours.', name: 'Neha and Karan', place: '2BHK, Pune' }
  ],

  faqs: [
    { q: 'How much does interior design cost?', a: 'It depends on the scope. Send us your floor plan and a rough budget on the inquiry form and we will come back with a room-wise estimate. Site visits and the first layout idea are free.' },
    { q: 'Do you work outside my city?', a: 'Yes. We run projects on-site across India and handle remote 3D work for clients anywhere.' },
    { q: 'How long does a full home take?', a: 'A 2BHK is usually 45 to 60 working days after the drawings are approved. Kitchens and wardrobes alone can be ready in 30 to 35 days.' },
    { q: 'Do you supply the furniture shown here?', a: 'Yes. Every piece listed can be supplied and installed as part of your project, or quoted separately for an existing home.' },
    { q: 'What do I need to share for a first quote?', a: 'Your floor plan (a photo works), the rooms you want done, approximate budget and your timeline. Use the inquiry form or WhatsApp us.' }
  ],

  cities: ['Mumbai', 'New Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Kolkata', 'Chennai', 'Ahmedabad', 'Other city', 'Outside India']
};
