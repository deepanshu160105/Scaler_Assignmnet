import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics',    slug: 'electronics',  description: 'Gadgets, accessories & smart devices', image: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp' },
  { name: 'Food',           slug: 'food',         description: 'Groceries, beverages & pantry staples', image: 'https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/thumbnail.webp' },
  { name: 'Clothing',       slug: 'clothing',     description: 'Shirts, shoes & fashion essentials', image: 'https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp' },
  { name: 'Home & Kitchen', slug: 'home-kitchen', description: 'Cookware, décor & kitchen essentials', image: 'https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp' },
  { name: 'Sports',         slug: 'sports',       description: 'Equipment, gear & outdoor accessories', image: 'https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/thumbnail.webp' },
  { name: 'Toys & Games',   slug: 'toys-games',   description: 'Decorations, models & collectibles', image: 'https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp' },
];

const products = [
  // ── Electronics ──
  { name: 'Apple AirPods Max Silver', slug: 'apple-airpods-max-silver', description: 'Premium over-ear headphones with Active Noise Cancellation, Transparency mode, and spatial audio. Anodized aluminium cups with breathable knit mesh canopy.', price: 54900, compareAtPrice: 59900, stock: 35, rating: 4.6, reviewCount: 1240, catSlug: 'electronics',
    images: ['https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/thumbnail.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/beats-flex-wireless-earphones/1.webp'],
    specifications: { Brand: 'Apple', Type: 'Over-Ear', Connectivity: 'Bluetooth 5.0', Battery: '20 hours' } },

  { name: 'Apple Watch Series 4 Gold', slug: 'apple-watch-series-4-gold', description: 'Stay connected and track your fitness with the Apple Watch Series 4 featuring GPS, heart rate monitor, and a stunning Retina display.', price: 32900, compareAtPrice: 39900, stock: 42, rating: 4.5, reviewCount: 980, catSlug: 'electronics',
    images: ['https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/thumbnail.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/2.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/3.webp'],
    specifications: { Brand: 'Apple', Display: '44mm Retina', Connectivity: 'GPS + Cellular', WaterResistance: '50m' } },

  { name: 'Amazon Echo Plus', slug: 'amazon-echo-plus', description: 'Smart speaker with premium sound and built-in Zigbee hub. Ask Alexa to play music, control your smart home, and get information.', price: 7999, compareAtPrice: 10999, stock: 120, rating: 4.3, reviewCount: 2100, catSlug: 'electronics',
    images: ['https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/thumbnail.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/1.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/2.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-homepod-mini-cosmic-grey/1.webp'],
    specifications: { Brand: 'Amazon', Assistant: 'Alexa', Connectivity: 'Wi-Fi, Bluetooth', SmartHub: 'Zigbee' } },

  { name: 'Apple iPhone Charger', slug: 'apple-iphone-charger', description: 'Official Apple 20W USB-C power adapter for fast charging your iPhone, iPad, and AirPods. Compact and travel-friendly design.', price: 1900, compareAtPrice: 2500, stock: 300, rating: 4.4, reviewCount: 3200, catSlug: 'electronics',
    images: ['https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/thumbnail.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/1.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-iphone-charger/2.webp','https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpower-wireless-charger/1.webp'],
    specifications: { Brand: 'Apple', Wattage: '20W', Port: 'USB-C', Compatibility: 'iPhone / iPad / AirPods' } },

  { name: 'Sony PlayStation 5 Console', slug: 'sony-playstation-5-console', description: 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio.', price: 49990, compareAtPrice: 54990, stock: 15, rating: 4.9, reviewCount: 8400, catSlug: 'electronics',
    images: ['https://picsum.photos/seed/ps5-1/400/400', 'https://picsum.photos/seed/ps5-2/400/400', 'https://picsum.photos/seed/ps5-3/400/400', 'https://picsum.photos/seed/ps5-4/400/400'],
    specifications: { Brand: 'Sony', Storage: '825GB SSD', Resolution: '8K Output', Connectivity: 'Wi-Fi 6' } },

  { name: 'Samsung Galaxy S23 Ultra', slug: 'samsung-galaxy-s23-ultra', description: 'The ultimate smartphone with a 200MP camera, built-in S Pen, and the fastest Snapdragon processor ever on a Galaxy device.', price: 124999, compareAtPrice: 134999, stock: 45, rating: 4.8, reviewCount: 5120, catSlug: 'electronics',
    images: ['https://picsum.photos/seed/s23-1/400/400', 'https://picsum.photos/seed/s23-2/400/400', 'https://picsum.photos/seed/s23-3/400/400', 'https://picsum.photos/seed/s23-4/400/400'],
    specifications: { Brand: 'Samsung', Display: '6.8" AMOLED', Camera: '200MP Main', Processor: 'Snapdragon 8 Gen 2' } },

  { name: 'Dell XPS 15 Laptop', slug: 'dell-xps-15-laptop', description: 'A powerful creator laptop featuring a stunning 15.6-inch OLED display, Intel Core i7 processor, and NVIDIA RTX graphics.', price: 185000, compareAtPrice: 205000, stock: 22, rating: 4.7, reviewCount: 1450, catSlug: 'electronics',
    images: ['https://picsum.photos/seed/xps-1/400/400', 'https://picsum.photos/seed/xps-2/400/400', 'https://picsum.photos/seed/xps-3/400/400', 'https://picsum.photos/seed/xps-4/400/400'],
    specifications: { Brand: 'Dell', RAM: '32GB', Storage: '1TB NVMe SSD', GPU: 'RTX 4060' } },

  // ── Food ──
  { name: 'Nescafe Classic Coffee', slug: 'nescafe-classic-coffee', description: 'Rich and aromatic instant coffee made from carefully selected Robusta beans. Perfect for a quick energy boost any time of day.', price: 450, compareAtPrice: 550, stock: 500, rating: 4.2, reviewCount: 4500, catSlug: 'food',
    images: ['https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/1.webp','https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/honey-jar/1.webp'],
    specifications: { Brand: 'Nescafe', Weight: '200g', Type: 'Instant Coffee', Origin: 'Robusta' } },

  { name: 'Whey Protein Powder', slug: 'whey-protein-powder', description: 'High-quality whey protein isolate for muscle recovery and growth. 25g protein per serving with minimal carbs and fat.', price: 2499, compareAtPrice: 3499, stock: 150, rating: 4.1, reviewCount: 1800, catSlug: 'food',
    images: ['https://cdn.dummyjson.com/product-images/groceries/protein-powder/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/protein-powder/1.webp','https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/1.webp'],
    specifications: { Brand: 'Generic', Weight: '1kg', ProteinPerServing: '25g', Flavour: 'Chocolate' } },

  { name: 'Organic Honey Jar', slug: 'organic-honey-jar', description: 'Pure, raw, unprocessed organic honey sourced from wildflower meadows. No added sugar, preservatives, or artificial flavours.', price: 599, compareAtPrice: 799, stock: 250, rating: 4.5, reviewCount: 2200, catSlug: 'food',
    images: ['https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/honey-jar/1.webp','https://cdn.dummyjson.com/product-images/groceries/nescafe-coffee/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/protein-powder/thumbnail.webp'],
    specifications: { Brand: 'Organic Farm', Weight: '500g', Type: 'Raw Wildflower', Certification: 'USDA Organic' } },

  { name: 'Fresh Fruit Juice Pack', slug: 'fresh-fruit-juice-pack', description: 'Refreshing 100% natural fruit juice made from freshly squeezed fruits. No added sugar or artificial preservatives.', price: 199, compareAtPrice: 299, stock: 400, rating: 4.0, reviewCount: 1500, catSlug: 'food',
    images: ['https://cdn.dummyjson.com/product-images/groceries/juice/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/juice/1.webp','https://cdn.dummyjson.com/product-images/groceries/honey-jar/thumbnail.webp','https://cdn.dummyjson.com/product-images/groceries/protein-powder/thumbnail.webp'],
    specifications: { Brand: 'Fresh Valley', Volume: '1L', Type: 'Mixed Fruit', Sugar: 'No Added Sugar' } },

  { name: 'Matcha Green Tea Powder', slug: 'matcha-green-tea-powder', description: 'Ceremonial grade organic matcha powder sourced directly from Kyoto, Japan. Perfect for lattes, baking, and traditional tea ceremonies.', price: 899, compareAtPrice: 1200, stock: 120, rating: 4.7, reviewCount: 890, catSlug: 'food',
    images: ['https://picsum.photos/seed/matcha-1/400/400', 'https://picsum.photos/seed/matcha-2/400/400', 'https://picsum.photos/seed/matcha-3/400/400', 'https://picsum.photos/seed/matcha-4/400/400'],
    specifications: { Brand: 'ZenTea', Weight: '100g', Type: 'Ceremonial Grade', Origin: 'Japan' } },

  { name: 'Premium Roasted Almonds', slug: 'premium-roasted-almonds', description: 'Crunchy, lightly salted roasted California almonds. A healthy snack packed with protein, healthy fats, and fiber.', price: 1199, compareAtPrice: 1499, stock: 300, rating: 4.6, reviewCount: 1150, catSlug: 'food',
    images: ['https://picsum.photos/seed/almonds-1/400/400', 'https://picsum.photos/seed/almonds-2/400/400', 'https://picsum.photos/seed/almonds-3/400/400', 'https://picsum.photos/seed/almonds-4/400/400'],
    specifications: { Brand: 'NuttyDelight', Weight: '1kg', Type: 'Roasted & Salted', Origin: 'California' } },

  { name: 'Swiss Dark Chocolate Bar', slug: 'swiss-dark-chocolate-bar', description: 'Intense 85% cocoa dark chocolate made by master Swiss chocolatiers. Gluten-free and rich in antioxidants.', price: 350, compareAtPrice: 450, stock: 450, rating: 4.8, reviewCount: 2200, catSlug: 'food',
    images: ['https://picsum.photos/seed/choc-1/400/400', 'https://picsum.photos/seed/choc-2/400/400', 'https://picsum.photos/seed/choc-3/400/400', 'https://picsum.photos/seed/choc-4/400/400'],
    specifications: { Brand: 'Lindt', Weight: '100g', Cocoa: '85%', Diet: 'Vegan Friendly' } },

  // ── Clothing ──
  { name: 'Gigabyte Aorus Men T-Shirt', slug: 'gigabyte-aorus-men-tshirt', description: 'Premium cotton gaming-themed T-shirt with bold Aorus eagle print. Comfortable fit for everyday wear and gaming events.', price: 999, compareAtPrice: 1499, stock: 200, rating: 4.3, reviewCount: 650, catSlug: 'clothing',
    images: ['https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp','https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/1.webp','https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/2.webp','https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/3.webp'],
    specifications: { Brand: 'Gigabyte', Material: '100% Cotton', Fit: 'Regular', Sizes: 'S, M, L, XL, XXL' } },

  { name: 'Nike Air Jordan 1 Red & Black', slug: 'nike-air-jordan-1-red-black', description: 'Iconic basketball sneaker with premium leather upper, Air-Sole cushioning, and the classic Wings logo. A streetwear staple.', price: 12995, compareAtPrice: 16995, stock: 60, rating: 4.7, reviewCount: 3400, catSlug: 'clothing',
    images: ['https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/thumbnail.webp','https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp','https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/2.webp','https://cdn.dummyjson.com/product-images/mens-shoes/puma-future-rider-trainers/1.webp'],
    specifications: { Brand: 'Nike', Material: 'Leather', Sole: 'Rubber', Closure: 'Lace-Up' } },

  { name: 'Man Plaid Casual Shirt', slug: 'man-plaid-casual-shirt', description: 'Classic plaid pattern button-down shirt in soft flannel. Perfect for casual outings, layering, and weekend wear.', price: 1299, compareAtPrice: 1999, stock: 180, rating: 4.2, reviewCount: 890, catSlug: 'clothing',
    images: ['https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp','https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/1.webp','https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/2.webp','https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/3.webp'],
    specifications: { Brand: 'Generic', Material: 'Flannel Cotton', Fit: 'Regular', Pattern: 'Plaid' } },

  { name: 'Man Short Sleeve Shirt', slug: 'man-short-sleeve-shirt', description: 'Lightweight short-sleeve shirt ideal for summer. Breathable fabric with a modern slim fit and versatile solid colour.', price: 899, compareAtPrice: 1299, stock: 220, rating: 4.1, reviewCount: 720, catSlug: 'clothing',
    images: ['https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp','https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/1.webp','https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/2.webp','https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/3.webp'],
    specifications: { Brand: 'Generic', Material: 'Cotton Blend', Fit: 'Slim', Sleeve: 'Short' } },

  { name: 'Classic Blue Denim Jeans', slug: 'classic-blue-denim-jeans', description: 'Timeless straight-leg blue jeans made from durable heavy-weight denim. Features a classic 5-pocket design and button fly.', price: 2499, compareAtPrice: 3499, stock: 150, rating: 4.5, reviewCount: 1340, catSlug: 'clothing',
    images: ['https://picsum.photos/seed/jeans-1/400/400', 'https://picsum.photos/seed/jeans-2/400/400', 'https://picsum.photos/seed/jeans-3/400/400', 'https://picsum.photos/seed/jeans-4/400/400'],
    specifications: { Brand: 'DenimCo', Material: '100% Cotton Denim', Fit: 'Straight Leg', Wash: 'Medium Blue' } },

  { name: 'Ultralight Running Sneakers', slug: 'ultralight-running-sneakers', description: 'Breathable mesh running shoes with responsive foam cushioning. Engineered for marathon runners and casual joggers alike.', price: 4999, compareAtPrice: 6500, stock: 85, rating: 4.7, reviewCount: 2100, catSlug: 'clothing',
    images: ['https://picsum.photos/seed/sneakers-1/400/400', 'https://picsum.photos/seed/sneakers-2/400/400', 'https://picsum.photos/seed/sneakers-3/400/400', 'https://picsum.photos/seed/sneakers-4/400/400'],
    specifications: { Brand: 'AeroStep', Material: 'Mesh', Sole: 'EVA Foam', Weight: '240g' } },

  { name: 'Thermal Winter Parka', slug: 'thermal-winter-parka', description: 'Water-resistant, insulated winter jacket featuring a faux-fur lined hood and fleece-lined pockets to withstand extreme cold.', price: 5499, compareAtPrice: 7999, stock: 40, rating: 4.6, reviewCount: 560, catSlug: 'clothing',
    images: ['https://picsum.photos/seed/parka-1/400/400', 'https://picsum.photos/seed/parka-2/400/400', 'https://picsum.photos/seed/parka-3/400/400', 'https://picsum.photos/seed/parka-4/400/400'],
    specifications: { Brand: 'NordicWear', Material: 'Polyester Blend', Insulation: 'Synthetic Down', Weather: 'Sub-zero' } },

  // ── Home & Kitchen ──
  { name: 'Black Aluminium Cup', slug: 'black-aluminium-cup', description: 'Sleek matte black aluminium cup with double-wall insulation. Keeps beverages hot or cold for hours. BPA-free and durable.', price: 499, compareAtPrice: 799, stock: 350, rating: 4.4, reviewCount: 1100, catSlug: 'home-kitchen',
    images: ['https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/1.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/2.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/glass/1.webp'],
    specifications: { Material: 'Aluminium', Capacity: '350ml', Insulation: 'Double Wall', Colour: 'Matte Black' } },

  { name: 'Carbon Steel Wok Pan', slug: 'carbon-steel-wok-pan', description: 'Professional-grade carbon steel wok with flat bottom for all stovetops. Pre-seasoned for natural non-stick cooking.', price: 1999, compareAtPrice: 2999, stock: 90, rating: 4.6, reviewCount: 780, catSlug: 'home-kitchen',
    images: ['https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/thumbnail.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/1.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/pan/1.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/silver-pot-with-glass-cap/1.webp'],
    specifications: { Material: 'Carbon Steel', Diameter: '14 inch', Handle: 'Wooden', Compatibility: 'All Stovetops' } },

  { name: 'Modern Table Lamp', slug: 'modern-table-lamp', description: 'Elegant modern table lamp with warm LED light and minimalist design. Touch-controlled brightness with 3 dimming levels.', price: 2499, compareAtPrice: 3499, stock: 75, rating: 4.3, reviewCount: 560, catSlug: 'home-kitchen',
    images: ['https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/thumbnail.webp','https://cdn.dummyjson.com/product-images/home-decoration/table-lamp/1.webp','https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp','https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/thumbnail.webp'],
    specifications: { Type: 'LED Table Lamp', Brightness: '3 Levels', Power: '12W', Material: 'Metal + Fabric' } },

  { name: 'Wooden Chopping Board', slug: 'wooden-chopping-board', description: 'Premium acacia wood chopping board with juice groove. Naturally antibacterial, durable, and gentle on knife edges.', price: 899, compareAtPrice: 1299, stock: 160, rating: 4.5, reviewCount: 940, catSlug: 'home-kitchen',
    images: ['https://cdn.dummyjson.com/product-images/kitchen-accessories/chopping-board/thumbnail.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/chopping-board/1.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/black-aluminium-cup/thumbnail.webp','https://cdn.dummyjson.com/product-images/kitchen-accessories/carbon-steel-wok/thumbnail.webp'],
    specifications: { Material: 'Acacia Wood', Size: '40x30cm', Features: 'Juice Groove', Care: 'Hand Wash' } },

  { name: 'Cordless Stick Vacuum', slug: 'cordless-stick-vacuum', description: 'Lightweight cordless vacuum with powerful suction, motorized brush roll, and up to 40 minutes of fade-free battery life.', price: 12500, compareAtPrice: 15000, stock: 65, rating: 4.6, reviewCount: 890, catSlug: 'home-kitchen',
    images: ['https://picsum.photos/seed/vacuum-1/400/400', 'https://picsum.photos/seed/vacuum-2/400/400', 'https://picsum.photos/seed/vacuum-3/400/400', 'https://picsum.photos/seed/vacuum-4/400/400'],
    specifications: { Brand: 'CleanHome', Battery: '40 mins runtime', Filter: 'HEPA', Weight: '2.5kg' } },

  { name: 'Automatic Espresso Maker', slug: 'automatic-espresso-maker', description: 'Compact espresso machine with 15-bar pump pressure and milk frother. Brews café-quality espresso and cappuccinos at home.', price: 8500, compareAtPrice: 11000, stock: 40, rating: 4.7, reviewCount: 650, catSlug: 'home-kitchen',
    images: ['https://picsum.photos/seed/espresso-1/400/400', 'https://picsum.photos/seed/espresso-2/400/400', 'https://picsum.photos/seed/espresso-3/400/400', 'https://picsum.photos/seed/espresso-4/400/400'],
    specifications: { Brand: 'BrewMaster', Pressure: '15 Bar', TankCapacity: '1.5L', Features: 'Milk Frother' } },

  { name: 'Enameled Cast Iron Dutch Oven', slug: 'enameled-cast-iron-dutch-oven', description: 'Heavy-duty 5.5-quart dutch oven with smooth enamel finish. Perfect for slow cooking, braising, and baking bread.', price: 4500, compareAtPrice: 6500, stock: 110, rating: 4.9, reviewCount: 1540, catSlug: 'home-kitchen',
    images: ['https://picsum.photos/seed/dutch-1/400/400', 'https://picsum.photos/seed/dutch-2/400/400', 'https://picsum.photos/seed/dutch-3/400/400', 'https://picsum.photos/seed/dutch-4/400/400'],
    specifications: { Material: 'Cast Iron', Capacity: '5.5 Quart', Coating: 'Enamel', OvenSafe: 'Up to 260°C' } },

  // ── Sports ──
  { name: 'Professional Cricket Bat', slug: 'professional-cricket-bat', description: 'Grade 1 English willow cricket bat with thick edges and full spine. Ideal for aggressive stroke play on all pitches.', price: 4999, compareAtPrice: 6999, stock: 45, rating: 4.4, reviewCount: 420, catSlug: 'sports',
    images: ['https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/1.webp','https://cdn.dummyjson.com/product-images/sports-accessories/football/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/thumbnail.webp'],
    specifications: { Material: 'English Willow', Weight: '1.2kg', GrainCount: '7+', Handle: 'Cane' } },

  { name: 'Metal Baseball Bat', slug: 'metal-baseball-bat', description: 'Lightweight aluminium alloy baseball bat with cushioned grip. Engineered for maximum swing speed and power hitting.', price: 1999, compareAtPrice: 2999, stock: 80, rating: 4.2, reviewCount: 350, catSlug: 'sports',
    images: ['https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/metal-baseball-bat/1.webp','https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/cricket-bat/1.webp'],
    specifications: { Material: 'Aluminium Alloy', Length: '34 inch', Grip: 'Cushioned Rubber', Weight: '900g' } },

  { name: 'Tennis Ball Pack', slug: 'tennis-ball-pack', description: 'Pack of 3 premium pressurised tennis balls. ITF approved for tournament play with consistent bounce and durability.', price: 399, compareAtPrice: 599, stock: 500, rating: 4.3, reviewCount: 1200, catSlug: 'sports',
    images: ['https://cdn.dummyjson.com/product-images/sports-accessories/tennis-ball/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/tennis-ball/1.webp','https://cdn.dummyjson.com/product-images/sports-accessories/football/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/football/1.webp'],
    specifications: { Brand: 'Generic', Quantity: '3 Balls', Type: 'Pressurised', Approval: 'ITF' } },

  { name: 'Classic Football', slug: 'classic-football', description: 'Official size 5 match football with hand-stitched panels. Designed for optimal flight, control, and all-weather durability.', price: 1499, compareAtPrice: 1999, stock: 130, rating: 4.5, reviewCount: 1800, catSlug: 'sports',
    images: ['https://cdn.dummyjson.com/product-images/sports-accessories/football/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/football/1.webp','https://cdn.dummyjson.com/product-images/sports-accessories/tennis-ball/thumbnail.webp','https://cdn.dummyjson.com/product-images/sports-accessories/tennis-ball/1.webp'],
    specifications: { Size: '5 (Official)', Material: 'PU Leather', Stitching: 'Hand-Stitched', Panels: 32 } },

  { name: 'Pro Carbon Badminton Racket', slug: 'pro-carbon-badminton-racket', description: 'Ultra-lightweight carbon fiber badminton racket. Offers excellent tension hold, control, and smashing power for advanced players.', price: 2199, compareAtPrice: 3500, stock: 95, rating: 4.5, reviewCount: 780, catSlug: 'sports',
    images: ['https://picsum.photos/seed/badminton-1/400/400', 'https://picsum.photos/seed/badminton-2/400/400', 'https://picsum.photos/seed/badminton-3/400/400', 'https://picsum.photos/seed/badminton-4/400/400'],
    specifications: { Material: 'Carbon Fiber', Weight: '82g', Tension: 'Up to 30 lbs', Flex: 'Medium' } },

  { name: 'Anti-Slip Yoga Mat', slug: 'anti-slip-yoga-mat', description: 'Eco-friendly TPE yoga mat with dual-layer design and alignment lines. 6mm thickness ensures comfort for all poses.', price: 999, compareAtPrice: 1499, stock: 250, rating: 4.6, reviewCount: 3200, catSlug: 'sports',
    images: ['https://picsum.photos/seed/yoga-1/400/400', 'https://picsum.photos/seed/yoga-2/400/400', 'https://picsum.photos/seed/yoga-3/400/400', 'https://picsum.photos/seed/yoga-4/400/400'],
    specifications: { Material: 'TPE Foam', Thickness: '6mm', Size: '183x61cm', EcoFriendly: 'Yes' } },

  { name: 'Anti-Fog Swimming Goggles', slug: 'anti-fog-swimming-goggles', description: 'Professional racing swim goggles featuring UV protection, an anti-fog coating, and adjustable silicone straps for a leak-proof fit.', price: 499, compareAtPrice: 899, stock: 400, rating: 4.3, reviewCount: 1100, catSlug: 'sports',
    images: ['https://picsum.photos/seed/goggles-1/400/400', 'https://picsum.photos/seed/goggles-2/400/400', 'https://picsum.photos/seed/goggles-3/400/400', 'https://picsum.photos/seed/goggles-4/400/400'],
    specifications: { Lens: 'Polycarbonate', Coating: 'Anti-Fog & UV', Strap: 'Silicone', Fit: 'Adjustable' } },

  // ── Toys & Games ──
  { name: 'Wooden Decoration Swing', slug: 'wooden-decoration-swing', description: 'Handcrafted miniature wooden swing for home décor. Intricate carvings with a vintage rustic finish. Perfect shelf accent.', price: 1299, compareAtPrice: 1799, stock: 100, rating: 4.6, reviewCount: 430, catSlug: 'toys-games',
    images: ['https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp','https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/1.webp','https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/2.webp','https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/3.webp'],
    specifications: { Material: 'Teak Wood', Finish: 'Rustic', Dimensions: '15x10x20cm', Type: 'Handcrafted' } },

  { name: 'Classic 300 Touring Car Model', slug: 'classic-300-touring-car-model', description: 'Die-cast 1:18 scale model of the iconic 300 Touring. Detailed interior, opening doors, and rubber tyres. Collector edition.', price: 3999, compareAtPrice: 5499, stock: 30, rating: 4.7, reviewCount: 280, catSlug: 'toys-games',
    images: ['https://cdn.dummyjson.com/product-images/vehicle/300-touring/thumbnail.webp','https://cdn.dummyjson.com/product-images/vehicle/300-touring/1.webp','https://cdn.dummyjson.com/product-images/vehicle/300-touring/2.webp','https://cdn.dummyjson.com/product-images/vehicle/300-touring/3.webp'],
    specifications: { Scale: '1:18', Material: 'Die-Cast Metal', Features: 'Opening Doors', Edition: 'Collector' } },

  { name: 'Family Tree Photo Frame', slug: 'family-tree-photo-frame', description: 'Beautiful tree-shaped multi-photo frame that holds 6 photos. Perfect wall art to display cherished family memories.', price: 1499, compareAtPrice: 2199, stock: 110, rating: 4.4, reviewCount: 520, catSlug: 'toys-games',
    images: ['https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp','https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/1.webp','https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/thumbnail.webp','https://cdn.dummyjson.com/product-images/home-decoration/decoration-swing/thumbnail.webp'],
    specifications: { Material: 'MDF + Metal', Photos: '6 Slots', Mounting: 'Wall Hang', Style: 'Tree Shape' } },

  { name: 'House Showpiece Plant', slug: 'house-showpiece-plant', description: 'Realistic artificial succulent in a ceramic pot. Zero maintenance greenery that adds life to any room, desk, or shelf.', price: 699, compareAtPrice: 999, stock: 200, rating: 4.3, reviewCount: 670, catSlug: 'toys-games',
    images: ['https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/thumbnail.webp','https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/1.webp','https://cdn.dummyjson.com/product-images/home-decoration/house-showpiece-plant/2.webp','https://cdn.dummyjson.com/product-images/home-decoration/family-tree-photo-frame/thumbnail.webp'],
    specifications: { Material: 'Plastic + Ceramic Pot', Height: '20cm', Type: 'Artificial Succulent', Maintenance: 'None' } },

  { name: 'Galactic Spaceship Building Set', slug: 'galactic-spaceship-building-set', description: 'Massive 1200-piece building block set to construct a highly detailed galactic cruiser. Great for kids and adult collectors.', price: 5500, compareAtPrice: 7000, stock: 55, rating: 4.8, reviewCount: 950, catSlug: 'toys-games',
    images: ['https://picsum.photos/seed/lego-1/400/400', 'https://picsum.photos/seed/lego-2/400/400', 'https://picsum.photos/seed/lego-3/400/400', 'https://picsum.photos/seed/lego-4/400/400'],
    specifications: { Pieces: '1200+', AgeRange: '12+ Years', Material: 'ABS Plastic', Theme: 'Space' } },

  { name: 'Portable Handheld Console', slug: 'portable-handheld-console', description: 'Play your favorite games anywhere. Features a vibrant 7-inch OLED screen, detachable controllers, and 64GB of storage.', price: 29990, compareAtPrice: 32990, stock: 25, rating: 4.9, reviewCount: 4300, catSlug: 'toys-games',
    images: ['https://picsum.photos/seed/switch-1/400/400', 'https://picsum.photos/seed/switch-2/400/400', 'https://picsum.photos/seed/switch-3/400/400', 'https://picsum.photos/seed/switch-4/400/400'],
    specifications: { Screen: '7-inch OLED', Storage: '64GB', Battery: 'Up to 9 hours', Multiplayer: 'Local & Online' } },

  { name: 'Classic Property Trading Game', slug: 'classic-property-trading-game', description: 'The fast-dealing property trading board game. Buy, sell, and scheme your way to riches. Includes classic metallic tokens.', price: 999, compareAtPrice: 1299, stock: 180, rating: 4.7, reviewCount: 5200, catSlug: 'toys-games',
    images: ['https://picsum.photos/seed/monopoly-1/400/400', 'https://picsum.photos/seed/monopoly-2/400/400', 'https://picsum.photos/seed/monopoly-3/400/400', 'https://picsum.photos/seed/monopoly-4/400/400'],
    specifications: { Players: '2-6', AgeRange: '8+ Years', GameTime: '60-120 mins', Type: 'Board Game' } },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (order matters for FK constraints)
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const catMap = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    catMap[cat.slug] = created.id;
    console.log(`  ✅ Category: ${cat.name}`);
  }

  // Create products
  for (const p of products) {
    const { catSlug, specifications, ...rest } = p;
    await prisma.product.create({
      data: { ...rest, categoryId: catMap[catSlug], specifications },
    });
    console.log(`  📦 Product: ${p.name}`);
  }

  console.log(`\n✅ Seeded ${categories.length} categories and ${products.length} products.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());