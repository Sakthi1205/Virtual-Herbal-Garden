# Styles Documentation

This folder contains all the CSS styles for the Herbal Garden application.

## File Structure

### `global.css`
Contains global styles for the entire application including:
- Reset and base styles
- Navigation components
- Plant model page layout
- Home page styles
- Animations and keyframes
- Responsive design
- Chat icon and floating elements

### `components.css`
Contains component-specific styles including:
- Plant description components
- Three.js model viewer
- Loading and error states
- Form elements
- Card components
- Badge components
- Modal components
- Tooltip styles
- Skeleton loading animations

## CSS Classes

### Navigation
- `.navbar` - Main navigation container
- `.nav-links` - Navigation links container
- `.nav-link` - Individual navigation links
- `.nav-icons` - Right side icons container
- `.nav-icon` - Individual icon buttons

### Plant Model Page
- `.plant-model-container` - Main container for plant model page
- `.model-section` - Left side 3D model section
- `.model-title` - Title for the 3D model section
- `.model-card` - Card containing the 3D model
- `.model-image` - Image within the model card
- `.bookmark-icon` - Bookmark button on model card
- `.content-section` - Right side content area
- `.read-content-btn` - Read content button
- `.section-title` - Section titles with icons
- `.plant-images` - Container for plant images
- `.plant-image` - Individual plant images
- `.notes-section` - Notes section at bottom
- `.notes-textarea` - Textarea for notes

### Home Page
- `.home-container` - Main home page container
- `.home-overlay` - Background overlay
- `.home-title` - Animated title
- `.search-container` - Search bar container
- `.search-input` - Search input field
- `.search-btn` - Search button
- `.error-message` - Error message styling
- `.plants-grid` - Grid for plant cards
- `.plant-card` - Individual plant card
- `.plant-name` - Plant name text

### Animations
- `@keyframes glow` - Text glow animation
- `@keyframes bounce` - Bounce animation
- `@keyframes float` - Float animation
- `@keyframes loading` - Skeleton loading animation

### Utility Classes
- `.chat-icon` - Floating chat button
- `.loading-container` - Loading state container
- `.error-container` - Error state container
- `.success-container` - Success state container

## Usage

Import the CSS files in your components:

```jsx
import '../styles/global.css';
import '../styles/components.css';
```

Or import them in your main App component:

```jsx
import './styles/global.css';
import './styles/components.css';
```

## Responsive Design

The styles include responsive breakpoints:
- Mobile: `max-width: 768px`
- Tablet: `max-width: 1024px`
- Desktop: `min-width: 1025px`

## Color Scheme

- Primary Green: `#28a745`
- Dark Green: `#218838`
- Light Gray: `#f8f9fa`
- Text Dark: `#333`
- Text Light: `#555`
- Border: `#e9ecef`
- Error Red: `#dc3545`
- Success Green: `#28a745`
- Warning Yellow: `#ffc107`
- Info Blue: `#007bff` 