import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, INITIAL_ORDERS } from './src/data/mockProducts.ts';
import { Product, Review, Order } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent state for the session
let inventoryState: Record<string, number> = {};
let productsData: Product[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let reviewsData: Review[] = JSON.parse(JSON.stringify(INITIAL_REVIEWS));
let ordersData: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));

// Initialize inventory
productsData.forEach((p) => {
  inventoryState[p.id] = p.stock;
});

// Periodic real-time inventory simulation
setInterval(() => {
  const randomProduct = productsData[Math.floor(Math.random() * productsData.length)];
  if (randomProduct && inventoryState[randomProduct.id] > 2) {
    const delta = Math.random() > 0.65 ? -1 : 1;
    inventoryState[randomProduct.id] = Math.max(1, inventoryState[randomProduct.id] + delta);
    randomProduct.stock = inventoryState[randomProduct.id];
  }
}, 20000);

// Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', brand: 'ElVine', time: new Date().toISOString() });
});

// Get products with real-time stock
app.get('/api/products', (req, res) => {
  const enriched = productsData.map((p) => ({
    ...p,
    stock: inventoryState[p.id] !== undefined ? inventoryState[p.id] : p.stock,
  }));
  res.json(enriched);
});

// Get real-time inventory map
app.get('/api/inventory', (req, res) => {
  res.json(inventoryState);
});

// Update specific inventory
app.post('/api/inventory/update', (req, res) => {
  const { productId, quantityChange } = req.body;
  if (!productId || typeof quantityChange !== 'number') {
    return res.status(400).json({ error: 'Invalid productId or quantityChange' });
  }

  const current = inventoryState[productId] ?? 10;
  const updated = Math.max(0, current + quantityChange);
  inventoryState[productId] = updated;

  const prod = productsData.find((p) => p.id === productId);
  if (prod) prod.stock = updated;

  res.json({ productId, stock: updated });
});

// Get reviews
app.get('/api/reviews', (req, res) => {
  const { productId } = req.query;
  if (productId) {
    const filtered = reviewsData.filter((r) => r.productId === productId);
    return res.json(filtered);
  }
  res.json(reviewsData);
});

// Add a review
app.post('/api/reviews', (req, res) => {
  const { productId, author, rating, title, comment, photos, sizePurchased, fitRating } = req.body;
  if (!productId || !author || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    productId,
    author: author || 'Verified ElVine Customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    rating: Number(rating),
    date: 'Just now',
    title: title || 'Verified Experience',
    comment,
    verified: true,
    helpfulVotes: 0,
    sizePurchased: sizePurchased || 'Size M',
    fitRating: fitRating || 'True to Size',
    photos: photos || [],
  };

  reviewsData.unshift(newReview);

  // Recalculate product rating
  const productReviews = reviewsData.filter((r) => r.productId === productId);
  const avgRating =
    productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  const prod = productsData.find((p) => p.id === productId);
  if (prod) {
    prod.rating = parseFloat(avgRating.toFixed(2));
    prod.reviewCount = productReviews.length;
  }

  res.status(201).json(newReview);
});

// Helpful vote on review
app.post('/api/reviews/:id/helpful', (req, res) => {
  const { id } = req.params;
  const review = reviewsData.find((r) => r.id === id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  review.helpfulVotes += 1;
  res.json({ id: review.id, helpfulVotes: review.helpfulVotes });
});

// Place order and decrement inventory in real-time
app.post('/api/orders', (req, res) => {
  const { items, subtotal, discount, shipping, tax, total, totalSavedVsTraditional, shippingAddress, paymentMethod } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  // Check inventory availability
  for (const item of items) {
    const currentStock = inventoryState[item.productId] ?? 10;
    if (currentStock < item.quantity) {
      const prod = productsData.find((p) => p.id === item.productId);
      return res.status(400).json({
        error: `Insufficient stock for "${prod?.title || 'item'}". Only ${currentStock} available.`,
        productId: item.productId,
        currentStock,
      });
    }
  }

  // Deduct inventory
  for (const item of items) {
    inventoryState[item.productId] = Math.max(0, (inventoryState[item.productId] ?? 10) - item.quantity);
    const prod = productsData.find((p) => p.id === item.productId);
    if (prod) {
      prod.stock = inventoryState[item.productId];
      prod.salesCount += item.quantity;
    }
  }

  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `ELV-${Math.floor(100000 + Math.random() * 900000)}`,
    date: 'Just now',
    status: 'Confirmed',
    items,
    subtotal: subtotal || 0,
    discount: discount || 0,
    shipping: shipping || 0,
    tax: tax || 0,
    total: total || 0,
    totalSavedVsTraditional: totalSavedVsTraditional || 0,
    shippingAddress: shippingAddress || {
      fullName: 'Camilla Laurent',
      street: '450 Sutter Street, Loft 8B',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94108',
      country: 'United States',
    },
    paymentMethod: paymentMethod || {
      type: 'card',
      last4: '4092',
      brand: 'visa',
    },
    trackingNumber: `1Z${Math.random().toString(36).substring(2, 12).toUpperCase()}ELV`,
    estimatedDelivery: 'In 2 business days (Carbon-Neutral Transit)',
  };

  ordersData.unshift(newOrder);
  res.status(201).json(newOrder);
});

// Get user orders
app.get('/api/orders', (req, res) => {
  res.json(ordersData);
});

// Smart Recommendations based on Search History and Browsing Patterns
app.post('/api/ai/recommendations', async (req, res) => {
  const { viewedProductIds = [], searchQueries = [], cartProductIds = [] } = req.body;

  const client = getGeminiClient();
  const catalogSummary = productsData.map((p) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    fabric: p.fabric,
    fit: p.fit,
    price: p.price,
    description: p.description,
  }));

  const viewedDetails = productsData.filter((p) => viewedProductIds.includes(p.id)).map((p) => `${p.title} (${p.fabric}, ${p.category})`);
  const cartDetails = productsData.filter((p) => cartProductIds.includes(p.id)).map((p) => p.title);

  if (client) {
    try {
      const prompt = `You are the Lead Capsule Wardrobe Stylist for ElVine, an American fashion brand founded in 2010 known for "Radical Transparency", timeless minimalist design, and sustainable ethical materials (Cashmere, French Linen, Japanese Selvedge Denim, Organic Cotton).
Given the customer's browsing patterns and search history, select 3 to 4 complementary garment product IDs from the catalog to curate their "Forever Wardrobe".

Customer Context:
- Recently Viewed Garments: ${viewedDetails.length ? viewedDetails.join(', ') : 'None yet'}
- Recent Search Terms: ${searchQueries.length ? searchQueries.join(', ') : 'None yet'}
- In Cart: ${cartDetails.length ? cartDetails.join(', ') : 'Empty'}

Catalog:
${JSON.stringify(catalogSummary, null, 2)}

Return a strict JSON array of objects with keys:
- "productId": the exact string id (e.g. "prod-1")
- "reason": a concise, refined 1-sentence explanation of why this piece effortlessly elevates their timeless capsule wardrobe (e.g. "Layers seamlessly over your organic pima tee for year-round architectural ease.")
- "matchScore": integer from 90 to 99
- "contextTag": short badge like "Forever Wardrobe Staple", "Capsule Essential", "Material Affinity", "Tailoring Complement"

Respond ONLY with the JSON array.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return res.json(parsed);
        }
      }
    } catch (err) {
      console.error('Gemini recommendations error, using heuristic fallback:', err);
    }
  }

  // Fallback Heuristic Recommendations Engine
  const recommended: Array<{ productId: string; reason: string; matchScore: number; contextTag: string }> = [];

  const viewedCategories = productsData
    .filter((p) => viewedProductIds.includes(p.id))
    .map((p) => p.category);

  for (const prod of productsData) {
    if (viewedProductIds.includes(prod.id) && productsData.length > 4) continue;

    let score = 86;
    let reason = 'Curated to complete your ethical minimalist wardrobe.';
    let tag = 'Forever Wardrobe Staple';

    if (viewedCategories.includes(prod.category)) {
      score += 7;
      reason = `Selected to complement your recent exploration of ${prod.category}.`;
      tag = `${prod.fabric} Synergy`;
    }

    if (searchQueries.some((q: string) => prod.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())) || prod.fabric.toLowerCase().includes(q.toLowerCase()))) {
      score += 6;
      reason = `Directly matches recent interest in ${prod.fabric} and ${prod.fit}.`;
      tag = 'Search Affinity';
    }

    if (prod.isFeatured) {
      score += 4;
    }

    recommended.push({
      productId: prod.id,
      reason,
      matchScore: Math.min(99, score),
      contextTag: tag,
    });
  }

  recommended.sort((a, b) => b.matchScore - a.matchScore);
  res.json(recommended.slice(0, 4));
});

// AI Shopping Stylist / Concierge Assistant
app.post('/api/ai/concierge', async (req, res) => {
  const { message, currentProductId } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const client = getGeminiClient();
  const catalogContext = productsData
    .map(
      (p) =>
        `[ID: ${p.id}] ${p.title} - ₹${p.price.toLocaleString('en-IN')} (Category: ${p.category}, Fabric: ${p.fabric}, Fit: ${p.fit}, Factory: ${p.factory.name} in ${p.factory.location}, True Cost: ₹${p.transparentCost.totalTrueCost.toLocaleString('en-IN')} vs Traditional Retail ₹${p.transparentCost.traditionalRetailPrice.toLocaleString('en-IN')})\nSummary: ${p.subtitle}. Material: ${p.materialDetails}`
    )
    .join('\n\n');

  if (client) {
    try {
      const systemInstruction = `You are ElVine's Senior Capsule Stylist and Radical Transparency Advisor.
ElVine is an American apparel brand founded in 2010 dedicated to Radical Transparency — disclosing exact factory conditions, true production costs, ethical fair wages, and offering timeless, high-quality garments (Cashmere, Organic Pima Cotton, French Linen, Japanese Selvedge Denim, Italian ReWool). Prices are in Indian Rupees (₹).

When advising customers:
1. Speak with quiet confidence, minimalist sophistication, and deep appreciation for sustainable fabrics and timeless styling.
2. Highlight why investing in a "Forever Wardrobe" beats disposable fast fashion.
3. If relevant, explain the Radical Transparency pricing breakdown or the ethical factory origins (like our Prato wool mill or Okayama denim shuttle looms).
4. Explicitly reference product IDs in brackets like [ID: prod-1] so customers can tap to view the garment.
5. Quote all prices in Indian Rupees (₹).
6. Keep your tone refined, warm, and concise (2-3 paragraphs max).

Catalog:
${catalogContext}`;

      const response = await client.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Customer: ${message}\n(Current product being viewed: ${currentProductId || 'Browsing Catalog'})`,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || 'I would be delighted to assist you in curating your ElVine Forever Wardrobe.';
      return res.json({ reply });
    } catch (err) {
      console.error('Gemini concierge error, falling back:', err);
    }
  }

  // Fallback Concierge
  const lower = message.toLowerCase();
  let reply =
    'Welcome to ElVine. Our Radical Transparency philosophy means we reveal true production costs, certified ethical factories, and grade-A sustainable materials. How can I assist your capsule wardrobe today?';

  if (lower.includes('cashmere') || lower.includes('sweater') || lower.includes('warm')) {
    reply =
      'Our [ID: prod-1] The Cashmere Crew Sweater (₹11,900) is spun from 15.2µm fibers for exceptional softness without pilling. Traditional retail charges ₹25,600 for this quality, but we share our full ₹5,760 true cost breakdown with you.';
  } else if (lower.includes('denim') || lower.includes('jean') || lower.includes('pant') || lower.includes('trouser')) {
    reply =
      'We recommend [ID: prod-2] The Straight Leg Organic Jean (₹7,800), woven on vintage shuttle looms in Okayama, Japan, paired with [ID: prod-5] The Way-High Drape Pant (₹9,400) for effortless everyday elegance.';
  } else if (lower.includes('transparency') || lower.includes('cost') || lower.includes('factory') || lower.includes('ethics')) {
    reply =
      'Radical Transparency is our core commitment since 2010. For every garment, we reveal the exact cost of materials, hardware, labor, transport, and import duties alongside fair wage audits from our family-owned partner ateliers in Italy, Peru, Portugal, and Japan.';
  } else if (lower.includes('coat') || lower.includes('jacket') || lower.includes('outerwear')) {
    reply =
      'The [ID: prod-3] The Italian ReWool Trench Coat (₹23,800) is tailored in Prato, Tuscany from 100% recycled wool melton. It is an architectural forever piece designed for decades of wear.';
  }

  res.json({ reply });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ElVine Server running on http://localhost:${PORT}`);
  });
}

startServer();
