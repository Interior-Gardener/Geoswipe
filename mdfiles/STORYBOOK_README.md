# 📖 Heritage Story Book Component

A beautiful, immersive storytelling component that presents heritage site information in a book-style experience.

## 🎯 Features

### 📚 Book-Style Experience
- **Book Cover**: Beautiful opening page with site name, category, and background image
- **Chapter Pages**: Left page shows images, right page shows detailed text
- **Page Navigation**: Previous/Next buttons with smooth transitions
- **Closing Page**: Completion message with options to read again or return to map

### 🎨 Visual Design
- **Parchment Theme**: Warm, heritage-inspired color scheme (#2c1810, #d4af37, #f4e4bc)
- **Typography**: Merriweather serif font for authentic book feel
- **Animations**: Smooth page flip transitions and hover effects
- **Responsive**: Works on all screen sizes

### 📖 Content Structure
The component automatically generates chapters from heritage site data:
1. **Chapter 1: Introduction** - Basic site information
2. **Chapter 2: History** - Historical background
3. **Chapter 3: Architecture** - Architectural details
4. **Chapter 4: Significance** - Cultural importance
5. **Chapter 5: Visiting Tips** - Practical information

## 🚀 Usage

### Direct Navigation
```javascript
// Navigate to story book for a specific site
navigate(`/story/${encodeURIComponent(siteName)}`);
```

### Example URLs
- `/story/Shaniwar%20Wada` - Opens Shaniwar Wada story
- `/story/Raigad%20Fort` - Opens Raigad Fort story
- `/story/Janjira%20Fort` - Opens Janjira Fort story

### Demo Page
Visit `/story-demo` to see a demonstration with multiple heritage sites.

## 🔧 API Integration

The component fetches data from:
```
GET /api/heritage/:name
```

### Required Data Structure
```javascript
{
  name: "Site Name",
  category: "Site Category", 
  year: "Year",
  info: {
    full: "Detailed description",
    history: "Historical information",
    architecture: "Architectural details", 
    significance: "Cultural significance",
    visitingTips: ["tip1", "tip2", "tip3"]
  },
  media: {
    panorama_url: "https://example.com/image.jpg"
  }
}
```

## 🎮 User Interactions

### Navigation
- **Next Page**: Click "Next ▶" button or use arrow keys
- **Previous Page**: Click "◀ Previous" button
- **Close**: Click X button, press ESC, or click outside modal
- **Read Again**: Available on closing page

### Keyboard Support
- **ESC**: Close the story book
- **Arrow Keys**: Navigate between pages (future enhancement)

## 🎨 Customization

### Colors
```css
--primary-bg: #2c1810;      /* Dark brown background */
--accent-gold: #d4af37;     /* Gold accents */
--page-bg: #f4e4bc;         /* Parchment page color */
--text-dark: #2c1810;       /* Dark text */
--text-light: #f4e4bc;      /* Light text */
```

### Fonts
- **Primary**: 'Merriweather', serif
- **Fallback**: Georgia, serif

## 📱 Responsive Design

- **Desktop**: Full two-page spread layout
- **Tablet**: Maintains book layout with adjusted sizing
- **Mobile**: Optimized for single-page viewing

## 🔮 Future Enhancements

- [ ] Audio narration with word highlighting
- [ ] Ken Burns effect on images
- [ ] Background music during page flips
- [ ] Bookmark functionality
- [ ] Print-friendly version
- [ ] Multiple language support
- [ ] Interactive elements within chapters

## 🧪 Testing

### Test the Component
1. Start your server: `npm run dev`
2. Visit: `http://localhost:5173/story-demo`
3. Click on any heritage site card
4. Navigate through the story book

### Test with Real Data
1. Ensure your server is running with populated heritage data
2. Navigate to: `http://localhost:5173/story/Shaniwar%20Wada`
3. Experience the full storytelling journey

## 📝 Notes

- The component is completely separate from HeritagePage.jsx as requested
- It fetches data directly from the server API
- All styling is inline for easy customization
- No external dependencies required
- Fully self-contained and reusable
