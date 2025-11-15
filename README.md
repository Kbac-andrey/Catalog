# Catalog Management Application

A modern Angular-based catalog management system that allows users to browse, search, filter, and manage catalog items with an intelligent quality scoring system. The application features both public and admin views, with comprehensive item management capabilities.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Core Functionality](#core-functionality)
- [Quality Scoring System](#quality-scoring-system)
- [Project Structure](#project-structure)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v19 or higher)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd catalog
```

2. Install dependencies:
```bash
npm install
```

## 💻 Development

### Start Development Server

To start the development server with hot-reload:

```bash
npm start
```

## 🧪 Testing

### Run Tests

To execute the unit tests:

```bash
npm test
```

This will:
- Run all unit tests using Karma and Jasmine
- Watch for file changes and re-run tests
- Generate code coverage reports

### Test Coverage

The project includes comprehensive test coverage for:
- Components (CatalogList, Admin, CatalogEdit, etc.)
- Services (CatalogService, FilterStateService, SearchStateService)
- Pipes (ScorePipe, ScoreBandPipe)
- Validators (forbiddenCharactersValidator, duplicateTagValidator)
- Utility functions (computeScore)

## 🏗️ Building

### Production Build

To build the application for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/catalog/browser/` directory.

### Build Options

- **Development build**: `npm run build` (default)
- **Watch mode**: `npm run watch` (rebuilds on file changes)

## 🎯 Core Functionality

### Public View

The public view (`/`) provides:

- **Catalog Browsing**: View all catalog items in a responsive grid layout
- **Search**: Real-time search by title or description with debouncing
- **Filtering**: Filter items by category
- **Sorting**: Sort items by quality score (ascending/descending)
- **Virtual Scrolling**: Efficient rendering of large item lists using Angular CDK
- **Item Details**: Click on any item to view comprehensive details including:
  - Full item information
  - Quality score breakdown
  - Score band visualization
  - Metadata (creator, creation date, approval status)

### Admin View

The admin view (`/admin`) includes all public features plus:

- **Item Approval**: Approve items that meet quality requirements (score ≥ 75)
- **Item Editing**: Edit item details including:
  - Title (required, with forbidden character validation)
  - Description (required, with forbidden character validation)
  - Category (required, with forbidden character validation)
  - Tags (dynamic list with duplicate prevention)
- **Quality Score Validation**: Visual indicators showing which items are eligible for approval
- **Real-time Updates**: Changes persist across page refreshes using localStorage

### Key Features

- **Reactive State Management**: Uses RxJS Observables and BehaviorSubjects for state management
- **OnPush Change Detection**: Optimized performance with OnPush change detection strategy
- **Form Validation**: Comprehensive validation with custom validators
- **Responsive Design**: Mobile-friendly layout with adaptive grid system
- **Loading States**: Visual feedback during data loading and search operations
- **Error Handling**: Graceful error handling with user-friendly messages

## 📊 Quality Scoring System

The application uses an intelligent quality scoring system to evaluate catalog items. This system helps ensure content quality and determines item approval eligibility.

### Score Calculation

Each catalog item receives a quality score calculated as follows:

**Base Score**: 40 points (all items start with this)

**Bonus Points** (up to 60 additional points):

| Rule | Condition | Points |
|------|-----------|--------|
| Title Length | Title length > 12 characters | +20 |
| Description Length | Description length > 60 characters | +15 |
| Category | Category is provided (non-empty) | +10 |
| Tags (1+) | Item has at least 1 tag | +10 |
| Tags (2+) | Item has at least 2 tags | +5 |

**Maximum Score**: 100 points (capped)

### Score Bands

Items are categorized into four quality bands based on their score:

#### 🟥 Poor (0-49 points)
- **Range**: 0 to 49
- **Can Approve**: ❌ No
- **Characteristics**: 
  - Missing essential information
  - Short titles and descriptions
  - No category or tags
- **Visual Indicator**: Red badge

#### 🟨 Fair (50-74 points)
- **Range**: 50 to 74
- **Can Approve**: ❌ No
- **Characteristics**:
  - Basic information provided
  - Some metadata present
  - Needs improvement for approval
- **Visual Indicator**: Orange badge

#### 🟩 Good (75-89 points)
- **Range**: 75 to 89
- **Can Approve**: ✅ Yes
- **Characteristics**:
  - Comprehensive information
  - Good title and description length
  - Proper categorization and tagging
- **Visual Indicator**: Green badge
- **Note**: This is the minimum threshold for approval

#### 🟦 Excellent (90-100 points)
- **Range**: 90 to 100
- **Can Approve**: ✅ Yes
- **Characteristics**:
  - Exceptional content quality
  - Long, descriptive titles and descriptions
  - Complete metadata (category + multiple tags)
- **Visual Indicator**: Blue badge

### Why These Thresholds?

The scoring system and thresholds were designed to:

1. **Encourage Quality Content**: The base score of 40 ensures all items have a starting point, while bonus points reward comprehensive information.

2. **Balance Simplicity and Completeness**: 
   - Title length > 12: Encourages descriptive titles without being too restrictive
   - Description length > 60: Ensures meaningful descriptions
   - Category requirement: Essential for organization
   - Tag system: Rewards both having tags (10 points) and having multiple tags (additional 5 points)

3. **Clear Approval Threshold**: The 75-point threshold (Good band) provides a clear, achievable goal for content creators while maintaining quality standards.

4. **Visual Feedback**: Color-coded bands provide immediate visual feedback about item quality, helping users understand what improvements are needed.

### Score Display

- Items display their score band with color-coded badges
- The details page shows a complete score breakdown
- Admin view highlights which items are eligible for approval


## 🛠️ Technologies Used

- **Angular 19**: Modern Angular framework with standalone components
- **RxJS**: Reactive programming for state management
- **Angular CDK**: Virtual scrolling and UI components
- **TypeScript**: Type-safe development
- **SCSS**: Styling with Sass
- **Angular In-Memory Web API**: Mock backend for development
- **Jasmine & Karma**: Testing framework
