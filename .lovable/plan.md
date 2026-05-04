
# JohnNil.com — All-in-One Premium Platform

## Overview
John Nil-এর জন্য একটি bilingual (বাংলা/English) অল-ইন-ওয়ান পার্সোনাল ব্র্যান্ড প্ল্যাটফর্ম। Vibrant gradient ডিজাইন, bold typography, playful animation সহ।

## Design Direction
- **Theme**: Vibrant gradient — colorful gradients (purple→pink→orange), bold typography, playful micro-animations
- **Font**: Hind Siliguri (Bangla) + Space Grotesk (English headings) + DM Sans (body)
- **Colors**: Deep purple primary, gradient accents, glassmorphism cards
- **Features**: Scrolling text marquees, smooth page transitions, product landing pages with related products below

## Site Sections & Pages

### 1. Homepage / Landing
- Hero section with John Nil's intro, animated gradient background, scrolling marquee text
- Quick links to all sections (Shop, Services, Portfolio, Blog, Used Market, House Rent)
- Social media feed preview (Instagram, WhatsApp, Facebook embeds)
- Customer reviews/testimonials carousel
- Language toggle (BN/EN) in navbar

### 2. Portfolio & Work Experience
- Personal profile with photo, bio, skills
- Work experience timeline
- Project showcase with filterable categories

### 3. Digital & Physical Product Shop
- Product listing with categories, search, filters
- Each product opens as a dedicated landing page
- Related products section below each product
- Cart system with quantity management

### 4. Service Orders
- Service catalog (digital services, consulting, custom work, any information request)
- Service detail landing pages
- Custom order form with full details + amount
- Order generation with complete payment flow

### 5. Blog
- Blog post listing with categories/tags
- Individual blog post pages
- Search functionality

### 6. Used Products Marketplace
- Anyone can post used items for sale (with registration)
- Browse, search, filter used products
- Contact seller / buy flow

### 7. House Rental (বাসা ভাড়া)
- Post rental listings (with registration)
- Browse rentals with location, price, details filters
- Contact landlord flow

### 8. Order & Payment System (Manual Phase)
- bKash/Nagad manual payment: show number, user sends money, uploads screenshot
- Order form: customer name, email, phone, address, order details, amount
- Order confirmation page with order ID
- Admin can view and manage orders

### 9. Notifications
- Email notification to jnilbd@gmail.com on new order (Lovable built-in email)
- Email confirmation to customer on order placement
- SMS integration placeholder (for future BulkSMSBD/SSL Wireless)

### 10. Contact & Social
- Contact info: 01774585757, jnilbd@gmail.com, Baridhara Dhaka
- WhatsApp floating button (01774585757)
- Social media links (Instagram, Facebook, WhatsApp)
- Embedded social posts/reviews

## Technical Architecture

### Frontend (React + Tailwind + Framer Motion)
- Language context provider for BN/EN switching
- Responsive design (mobile-first)
- Framer Motion animations throughout
- React Router for all pages

### Backend (Lovable Cloud)
- **Database tables**: products, services, orders, order_items, blog_posts, used_products, house_rentals, reviews, user_profiles
- **Auth**: User registration for marketplace & rental posting
- **Storage**: Product images, payment screenshots, blog images
- **Edge Functions**: Order notification emails

### Pages to Create
1. `/` — Homepage
2. `/portfolio` — Portfolio & Experience
3. `/shop` — Product listing
4. `/shop/:id` — Product landing page
5. `/services` — Service catalog
6. `/services/:id` — Service detail + order
7. `/blog` — Blog listing
8. `/blog/:id` — Blog post
9. `/marketplace` — Used products
10. `/rentals` — House rentals
11. `/cart` — Shopping cart
12. `/checkout` — Checkout + payment
13. `/order-confirmation/:id` — Order confirmation
14. `/admin` — Admin dashboard (orders, products, content management)

## Implementation Order
1. Design system setup (colors, fonts, tokens, animations)
2. Layout shell (navbar with language toggle, footer, WhatsApp button)
3. Homepage with all sections
4. Product shop + product landing pages
5. Service catalog + order system
6. Cart + checkout + manual payment flow
7. Portfolio & blog pages
8. Used marketplace + house rental sections
9. Backend (Lovable Cloud): database, auth, storage
10. Order notifications (email)
11. Admin dashboard
12. Social embeds, reviews, scrolling marquees, polish
