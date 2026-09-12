# 🏛️ HeritageCard Component

A reusable, customizable card component for displaying heritage site information with beautiful animations and flexible styling options.

## 🎯 Features

### 🎨 Visual Design
- **Modern Card Layout**: Clean, professional design with subtle shadows
- **Hover Animations**: Smooth lift effect and color transitions
- **Responsive**: Adapts to different screen sizes
- **Customizable**: Extensive styling and content options

### 🔧 Functionality
- **Click Handling**: Full card click support with event propagation control
- **Icon System**: Automatic category-based icons with custom override option
- **Flexible Content**: Optional description, category, year display
- **Button Customization**: Customizable button text, colors, and styles

## 🚀 Usage

### Basic Usage
```jsx
import HeritageCard from './HeritageCard';

const site = {
  name: 'Shaniwar Wada',
  category: 'Historic Fort',
  year: '1732',
  description: 'Historic fort palace of the Peshwas'
};

<HeritageCard
  site={site}
  onCardClick={(site) => console.log('Clicked:', site.name)}
/>
```

### Advanced Usage
```jsx
<HeritageCard
  site={site}
  onCardClick={handleCardClick}
  buttonText="📖 Read Story"
  buttonColor="#d4af37"
  customIcon="🏰"
  showCategory={true}
  showYear={true}
  cardStyle={{ backgroundColor: '#f0f0f0' }}
  buttonStyle={{ fontSize: '16px' }}
/>
```

## 📋 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `site` | Object | Required | Heritage site data object |
| `onCardClick` | Function | - | Callback when card is clicked |
| `buttonText` | String | "📖 Read Story" | Text displayed on the button |
| `buttonColor` | String | "#d4af37" | Button background color |
| `showCategory` | Boolean | true | Show/hide category information |
| `showYear` | Boolean | true | Show/hide year information |
| `customIcon` | String | null | Custom icon (overrides category-based icon) |
| `cardStyle` | Object | {} | Additional styles for the card container |
| `buttonStyle` | Object | {} | Additional styles for the button |

## 🏗️ Site Object Structure

```javascript
const site = {
  name: "Site Name",           // Required: Display name
  category: "Site Category",   // Optional: Used for default icon
  year: "Year",               // Optional: Construction/year info
  description: "Description", // Optional: Brief description
  additionalInfo: "Extra"     // Optional: Additional info section
};
```

## 🎨 Icon System

### Automatic Icons (based on category)
- **Historic Fort**: 🏰
- **Temple**: 🛕
- **Cave**: 🕳️
- **Museum**: 🏛️
- **Palace**: 🏰
- **Market**: 🏪
- **Default**: 🏛️

### Custom Icons
```jsx
<HeritageCard
  site={site}
  customIcon="👑"  // Override automatic icon
/>
```

## 🎨 Styling Examples

### Custom Button Colors
```jsx
<HeritageCard
  site={site}
  buttonColor="#e74c3c"  // Red
  buttonText="🔴 Red Button"
/>

<HeritageCard
  site={site}
  buttonColor="#3498db"  // Blue
  buttonText="🔵 Blue Button"
/>
```

### Custom Card Styling
```jsx
<HeritageCard
  site={site}
  cardStyle={{
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none'
  }}
  buttonStyle={{
    backgroundColor: 'white',
    color: '#667eea',
    border: '2px solid white'
  }}
/>
```

### Hide Information
```jsx
<HeritageCard
  site={site}
  showCategory={false}  // Hide category
  showYear={false}      // Hide year
/>
```

## 🎮 Event Handling

### Card Click
```jsx
const handleCardClick = (site) => {
  console.log('Card clicked:', site.name);
  // Navigate, open modal, etc.
};

<HeritageCard
  site={site}
  onCardClick={handleCardClick}
/>
```

### Button Click
The button click automatically calls the same `onCardClick` function but prevents event propagation to avoid double-triggering.

## 📱 Responsive Design

The component automatically adapts to different screen sizes:
- **Desktop**: Full card layout with hover effects
- **Tablet**: Maintains layout with adjusted spacing
- **Mobile**: Optimized touch targets and spacing

## 🎨 CSS Classes

The component uses inline styles for maximum flexibility, but you can override with custom styles:

```jsx
<HeritageCard
  site={site}
  cardStyle={{
    // Override any card styles
    borderRadius: '20px',
    padding: '30px'
  }}
  buttonStyle={{
    // Override any button styles
    borderRadius: '30px',
    fontSize: '18px'
  }}
/>
```

## 🔧 Integration Examples

### With React Router
```jsx
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  const handleCardClick = (site) => {
    navigate(`/heritage/${site.name}`);
  };
  
  return (
    <HeritageCard
      site={site}
      onCardClick={handleCardClick}
      buttonText="📍 Visit Site"
    />
  );
};
```

### With State Management
```jsx
const [selectedSite, setSelectedSite] = useState(null);

const handleCardClick = (site) => {
  setSelectedSite(site);
  // Open modal, update state, etc.
};

<HeritageCard
  site={site}
  onCardClick={handleCardClick}
  buttonText="ℹ️ View Details"
/>
```

## 🧪 Testing

### Test the Component
1. Visit: `http://localhost:5173/card-examples`
2. See various styling and configuration examples
3. Test hover effects and click interactions

### Test in StoryBook Demo
1. Visit: `http://localhost:5173/story-demo`
2. See the component in action with real heritage sites

## 🎯 Best Practices

### Performance
- Use `React.memo()` for large lists of cards
- Implement proper key props in map functions
- Consider lazy loading for large datasets

### Accessibility
- Ensure sufficient color contrast
- Provide meaningful button text
- Consider keyboard navigation

### Styling
- Use consistent color schemes across your app
- Test on different screen sizes
- Consider dark mode compatibility

## 🔮 Future Enhancements

- [ ] Loading states
- [ ] Image support
- [ ] Rating system
- [ ] Favorite/bookmark functionality
- [ ] Animation presets
- [ ] Theme system
- [ ] Accessibility improvements

## 📝 Notes

- The component is fully self-contained with no external dependencies
- All styling is inline for maximum customization flexibility
- Hover effects are optimized for performance
- The component handles edge cases gracefully (missing data, etc.)
