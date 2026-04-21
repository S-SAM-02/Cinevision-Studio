================================================================
  CINEVISION STUDIO — Premium Cinematic Photography Website
  Studio: Bengaluru, India
  Version: 2.0 (Fixed & Enhanced)
================================================================

HOW TO OPEN
  1. Extract the CINEVISION ZIP anywhere on your computer
  2. Open the folder CINEVISION/
  3. Double-click welcome.html to start
  → welcome.html → ENTER STUDIO button → index.html (main site)

  All pages work completely OFFLINE.
  Internet is only needed to load placeholder images from picsum.photos.
  Replace them with your own images via admin panel or gallery.json.

================================================================
  FILES & FOLDERS
================================================================

CINEVISION/
├── welcome.html     → Premium cinematic entry screen
├── index.html       → Main website (hero, portfolio, services,
│                      about, pricing, testimonials, contact)
├── admin.html       → Admin panel (login required)
├── css/
│   └── style.css    → All styling (fixed + responsive)
├── js/
│   └── app.js       → All logic (gallery, admin, security)
├── data/
│   └── gallery.json → ⭐ EDIT THIS to add image URLs easily
├── images/
│   ├── default/     → Put your local default images here
│   └── uploads/     → Admin uploads go here (via IndexedDB)
├── assets/
│   └── logo.jpeg    → Studio logo
└── README.txt       → This file

================================================================
  ADMIN PANEL LOGIN
================================================================

URL:      Open admin.html in your browser
Username: CV2023
Password: Cin2023V

Features:
  ✅ Drag & drop image upload
  ✅ Multiple image upload at once
  ✅ Assign to any category
  ✅ Add title/label to image
  ✅ Progress bar during upload
  ✅ Star (★) to feature / unfeature images
  ✅ Delete images
  ✅ Filter gallery by category
  ✅ View image count stats

Images are stored in your browser's IndexedDB — they persist
between sessions but are device-specific (per browser).

================================================================
  GALLERY CATEGORIES
================================================================

  wedding, baby, prewedding, events, cinematic, drone, commercial

  • ALL tab     → Shows up to 8 featured images
  • Other tabs  → Show only their category images
  • No mixing   → Categories are strictly separated

================================================================
  HOW TO ADD IMAGES VIA JSON (EASIEST)
================================================================

STEP 1: Open  data/gallery.json  in any text editor

STEP 2: Find your category (wedding, baby, prewedding, etc.)

STEP 3: Add image URLs inside the array:

  "wedding": [
    "images/default/wed1.jpg",
    "https://example.com/wedding-photo.jpg"
  ]

STEP 4: Save and REFRESH the website

HOW TO USE LOCAL IMAGES:
  1. Copy your images into  images/default/
  2. Reference as:  "images/default/yourphoto.jpg"

HOW TO USE GOOGLE DRIVE:
  1. Upload to Google Drive, Share → Anyone with link
  2. Get file ID from URL
  3. Use: "https://drive.google.com/uc?id=FILE_ID"

================================================================
  FIXES APPLIED IN THIS VERSION
================================================================

  ✅ CINEVISION forced single line (white-space: nowrap)
  ✅ Perfect mobile responsiveness on all screen sizes
  ✅ Non-premium chat icons hidden
  ✅ Text updated to "5+ YEARS OF EXCELLENCE"
  ✅ WhatsApp button: wa.me/918296330246
  ✅ Smooth fade transition on welcome page
  ✅ Mobile hamburger menu fixed
  ✅ Gallery tabs scroll on mobile
  ✅ All grid layouts stack on mobile

================================================================
  SECURITY FEATURES (BUILT IN)
================================================================

  ✅ Right-click disabled (context menu blocked)
  ✅ F12 / DevTools shortcuts blocked
  ✅ Ctrl+U (view source) blocked
  ✅ Ctrl+S (save page) blocked
  ✅ Image dragging disabled
  ✅ CINEVISION watermark overlay on all pages

================================================================
  CONTACT / STUDIO DETAILS
================================================================

  Studio:    CINEVISION Studio, Bengaluru, India
  Phone:     +91 8296330246
  WhatsApp:  https://wa.me/918296330246
  Email:     cinevision@gmail.com
  Instagram: @cinevision.in

================================================================
  STORAGE
================================================================

  • IndexedDB — Browser-based persistent image storage
  • gallery.json — Static JSON for URL-based images
  • Both systems work together seamlessly

================================================================
  CUSTOMIZATION
================================================================

  LOGO:     Replace assets/logo.jpeg with your logo
  COLORS:   Edit css/style.css — change --red and --black
  CONTENT:  Edit text directly in index.html
  PRICING:  Search "₹7499" in index.html to update price
  CONTACT:  Search "8296330246" in all HTML files

================================================================
