# Tally Workspace UI Design Guide

## Overview
This comprehensive design guide documents the visual design system, components, patterns, and standards used throughout the Tally workspace. It serves as a reference for UI developers to maintain consistency and quality across all Tally-related interfaces.

---

## Table of Contents
1. [Design System Foundation](#design-system-foundation)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Layout Patterns](#layout-patterns)
6. [Navigation Structure](#navigation-structure)
7. [Data Display Patterns](#data-display-patterns)
8. [Interactive Elements](#interactive-elements)
9. [Page Templates](#page-templates)
10. [Responsive Design](#responsive-design)
11. [Accessibility Guidelines](#accessibility-guidelines)
12. [Best Practices](#best-practices)

---

## Design System Foundation

### Core Design Principles
- **Professional**: Clean, corporate aesthetic inspired by Tally's traditional blue interface
- **Functional**: Data-driven design prioritizing information clarity and accessibility
- **Consistent**: Unified visual language across all Tally workspace components
- **Scalable**: Flexible component system supporting various data densities and screen sizes

### Design System Structure
- **Semantic CSS Variables**: All colors, spacing, and typography use CSS custom properties
- **HSL Color Format**: Consistent color format across all design tokens
- **Component Variants**: Shadcn-based components with custom variants for Tally-specific use cases
- **Gradient System**: Professional gradient overlays for visual hierarchy and depth

---

## Color Palette

### Primary Colors (Professional Blue Theme)
```css
/* Light Mode */
--primary: 220 90% 56%;           /* Main brand blue */
--primary-foreground: 210 20% 98%; /* White text on primary */
--primary-hover: 220 90% 50%;      /* Darker blue for hover states */
--primary-glow: 220 90% 70%;       /* Lighter blue for glows/highlights */

/* Background Colors */
--background: 210 20% 98%;         /* Main background (light gray-blue) */
--foreground: 220 90% 15%;         /* Main text color (dark blue) */

/* Card & Surface Colors */
--card: 0 0% 100%;                 /* Pure white for cards */
--card-foreground: 220 90% 15%;    /* Dark blue text on cards */

/* Secondary Colors */
--secondary: 220 14.3% 95.9%;      /* Light gray-blue */
--secondary-foreground: 220 9% 15%; /* Dark text on secondary */

/* Accent Colors */
--accent: 220 14.3% 95.9%;         /* Same as secondary for consistency */
--accent-foreground: 220 9% 15%;   /* Dark text on accent */

/* Utility Colors */
--muted: 220 14.3% 95.9%;          /* Subtle backgrounds */
--muted-foreground: 220 8.9% 46.1%; /* Muted text */
--border: 220 13% 91%;             /* Border color */
--input: 220 13% 91%;              /* Input field borders */
```

### Dark Mode Colors
```css
/* Dark Mode Adaptations */
--background: 220 90% 8%;          /* Dark blue background */
--foreground: 210 20% 98%;         /* Light text */
--card: 220 90% 10%;               /* Dark blue cards */
--card-foreground: 210 20% 98%;    /* Light text on dark cards */
```

### Status Colors
```css
--destructive: 0 84% 60%;          /* Red for errors/delete actions */
--warning: 43 96% 56%;             /* Orange for warnings */
```

### Gradient System
```css
/* Professional Blue Gradients */
--gradient-primary: linear-gradient(135deg, hsl(220 90% 56%), hsl(220 90% 70%));
--gradient-accent: linear-gradient(135deg, hsl(220 90% 56%), hsl(225 85% 60%));
--gradient-hero: linear-gradient(135deg, hsl(220 90% 56%) 0%, hsl(225 85% 60%) 50%, hsl(230 80% 65%) 100%);
--gradient-subtle: linear-gradient(180deg, hsl(210 20% 98%) 0%, hsl(220 14.3% 95.9%) 100%);
```

### Shadow System
```css
/* Professional Shadows with Blue Tint */
--shadow-soft: 0 2px 8px -2px hsl(220 90% 56% / 0.1);
--shadow-medium: 0 4px 16px -4px hsl(220 90% 56% / 0.15);
--shadow-strong: 0 8px 32px -8px hsl(220 90% 56% / 0.2);
--shadow-glow: 0 0 40px hsl(220 90% 70% / 0.3);
```

---

## Typography

### Font System
- **Primary Font**: System font stack (default browser fonts)
- **Weight Scale**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Size Scale**: Tailwind's default scale (xs, sm, base, lg, xl, 2xl, 3xl)

### Typography Hierarchy
```css
/* Page Titles */
.text-3xl.font-bold            /* H1 - Main page headings */

/* Section Titles */
.text-2xl.font-semibold        /* H2 - Card titles, section headers */

/* Subsection Titles */
.text-lg.font-medium           /* H3 - Sub-component titles */

/* Body Text */
.text-sm                       /* Standard body text */
.text-xs                       /* Small details, labels */

/* Muted Text */
.text-muted-foreground         /* Secondary information */
```

### Usage Guidelines
- **Page Headers**: Always use H1 (text-3xl font-bold) for main page titles
- **Card Titles**: Use H2 (text-2xl font-semibold) for primary card headers
- **Data Labels**: Use text-sm with font-medium for form labels and data headers
- **Secondary Info**: Use text-muted-foreground for non-critical information

---

## Component Library

### Core Components (Shadcn-based)

#### Button Component
```tsx
// Primary Action Button
<Button variant="default">Primary Action</Button>

// Secondary Action Button  
<Button variant="outline">Secondary Action</Button>

// Destructive Action Button
<Button variant="destructive">Delete</Button>

// Ghost Button (minimal)
<Button variant="ghost">Cancel</Button>

// Professional Variant (custom)
<Button variant="professional">Professional Action</Button>

// Accent Variant (custom)
<Button variant="accent">Accent Action</Button>
```

#### Card Component Structure
```tsx
<Card className="shadow-medium border-0">
  <CardHeader className="pb-4">
    <CardTitle className="flex items-center gap-3 text-xl">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      Page Title
    </CardTitle>
    <CardDescription>
      Subtitle or description text
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
</Card>
```

#### Table Component Pattern
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Column Name</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### Badge Component Variants
```tsx
// Default Badge
<Badge variant="default">Active</Badge>

// Secondary Badge
<Badge variant="secondary">Inactive</Badge>

// Outline Badge
<Badge variant="outline">Pending</Badge>

// Custom Status Badges
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
  Tally Enabled
</Badge>
```

#### Input Component Patterns
```tsx
// Search Input with Icon
<div className="relative flex-1">
  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Search..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-8"
  />
</div>

// Date Input
<Input
  type="date"
  value={dateFrom}
  onChange={(e) => setDateFrom(e.target.value)}
/>
```

### Tally-Specific Components

#### Filter Bar Pattern
```tsx
<div className="flex flex-wrap items-center gap-2 mb-4">
  {/* Search */}
  <div className="relative flex-1 min-w-64">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input placeholder="Search..." className="pl-8" />
  </div>
  
  {/* Date Filters */}
  <Input type="date" placeholder="From Date" />
  <Input type="date" placeholder="To Date" />
  
  {/* Quick Date Buttons */}
  <div className="flex gap-1">
    <Button variant="outline" size="sm">Today</Button>
    <Button variant="outline" size="sm">Last 7 Days</Button>
    <Button variant="outline" size="sm">Last 30 Days</Button>
  </div>
  
  {/* Actions */}
  <Button onClick={handleSearch}>
    <Search className="h-4 w-4 mr-2" />
    Search
  </Button>
  <Button variant="outline" onClick={clearFilters}>
    <X className="h-4 w-4 mr-2" />
    Clear
  </Button>
</div>
```

#### Data Loading States
```tsx
// Loading Skeleton
{loading ? (
  <div className="text-center py-8">
    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
    <p className="text-muted-foreground">Loading data...</p>
  </div>
) : (
  /* Actual content */
)}

// Error State
{error ? (
  <div className="text-center py-8">
    <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
    <p className="text-destructive">{error}</p>
    <Button variant="outline" onClick={handleRetry} className="mt-4">
      Try Again
    </Button>
  </div>
) : (
  /* Actual content */
)}

// Empty State
{data.length === 0 ? (
  <div className="text-center py-8">
    <p className="text-muted-foreground">No records found</p>
  </div>
) : (
  /* Data display */
)}
```

#### Currency Formatting
```tsx
// Standard Currency Formatter
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Usage in Components
<span className={amount >= 0 ? "text-green-600" : "text-red-600"}>
  {formatCurrency(amount)}
</span>
```

#### Date Formatting
```tsx
// Date Formatter for Tally Dates
const formatDate = (dateStr: string) => {
  // Handles various Tally date formats: "7-Jul-25", "20250707", ISO dates
  // Returns DD/MM/YYYY format
};

// Usage
<span>{formatDate(voucher.date)}</span>
```

---

## Layout Patterns

### Page Layout Structure
```tsx
// Standard Page Layout
<div className="p-6 space-y-6 min-h-screen bg-gradient-subtle">
  {/* Header Card */}
  <Card className="shadow-medium border-0">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          Page Title
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline">Secondary Action</Button>
          <Button>Primary Action</Button>
        </div>
      </div>
    </CardHeader>
  </Card>

  {/* Main Content Card */}
  <Card className="shadow-medium border-0">
    <CardHeader>
      <CardTitle>Content Section</CardTitle>
      <CardDescription>Section description</CardDescription>
    </CardHeader>
    <CardContent>
      {/* Main content */}
    </CardContent>
  </Card>
</div>
```

### Grid Layout Patterns
```tsx
// Stats Grid (2-4 columns)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map((stat) => (
    <Card key={stat.id}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
          <stat.icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  ))}
</div>

// Two-Column Layout
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <Card>
    {/* Left column content */}
  </Card>
  <Card>
    {/* Right column content */}
  </Card>
</div>
```

### Modal/Dialog Patterns
```tsx
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Icon className="h-5 w-5" />
        Dialog Title
      </DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      {/* Dialog content */}
    </div>
    
    <div className="flex justify-end gap-2 pt-4">
      <Button variant="outline" onClick={() => setShowDialog(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save
      </Button>
    </div>
  </DialogContent>
</Dialog>
```

---

## Navigation Structure

### Sidebar Navigation
The Tally workspace uses a hierarchical sidebar structure:

```
Organization Hierarchy
├── Company 1
│   ├── Division 1 (Tally Enabled)
│   │   ├── Masters
│   │   │   ├── Groups
│   │   │   ├── Ledgers
│   │   │   ├── Stock Items
│   │   │   └── ...
│   │   ├── Transactions
│   │   │   ├── Voucher Management
│   │   │   ├── Accounting
│   │   │   └── ...
│   │   ├── Display
│   │   │   ├── Analytics Dashboard
│   │   │   ├── DayBook
│   │   │   └── ...
│   │   └── Utilities
│   │       ├── Configuration
│   │       └── Data Management
│   └── Division 2 (Tally Enabled)
└── Company 2
```

### Sidebar Styling
```tsx
// Company Level
<div className="flex items-center w-full rounded-lg hover:bg-muted/50 transition-smooth">
  <Building size={16} className="mr-2" />
  <span className="text-sm font-semibold">{company.name}</span>
</div>

// Division Level  
<div className="flex items-center w-full rounded-lg hover:bg-muted/50 transition-smooth">
  <Building2 size={16} className="mr-2" />
  <span className="text-sm font-medium">{division.name}</span>
  <div className="w-2 h-2 rounded-full bg-green-500 ml-2" title="Tally Enabled" />
</div>

// Menu Categories (expanded under division)
<div className="bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary py-3 px-4 shadow-soft">
  {/* Tally menu items */}
</div>
```

### Header Navigation
```tsx
<header className="sticky top-0 h-12 border-b border-border bg-sidebar backdrop-blur supports-[backdrop-filter]:bg-sidebar">
  <div className="flex items-center justify-between h-full px-6">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-white" />
        <span className="text-base font-semibold text-white">Vyaapari360</span>
      </div>
      <SidebarTrigger className="text-white hover:bg-white/10" />
      {/* Search bar */}
    </div>
    <div className="flex items-center gap-3">
      {/* Notifications, settings, profile */}
    </div>
  </div>
</header>
```

---

## Data Display Patterns

### Table Design Standards
```tsx
// Standard Table with Professional Styling
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[200px]">Name</TableHead>
      <TableHead>Type</TableHead>
      <TableHead className="text-right">Amount</TableHead>
      <TableHead className="w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id} className="hover:bg-muted/50">
        <TableCell className="font-medium">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <div>
              <div>{item.name}</div>
              {item.alias && (
                <div className="text-sm text-muted-foreground">
                  Alias: {item.alias}
                </div>
              )}
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline">{item.type}</Badge>
        </TableCell>
        <TableCell className="text-right">
          <span className={item.amount >= 0 ? "text-green-600" : "text-red-600"}>
            {formatCurrency(item.amount)}
          </span>
        </TableCell>
        <TableCell>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Card-Based Data Display
```tsx
// Data Summary Cards
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Total Vouchers</p>
          <p className="text-2xl font-bold">{stats.totalVouchers}</p>
        </div>
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>
    </CardContent>
  </Card>
</div>

// Detailed Information Cards
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Content sections */}
    </div>
  </CardContent>
</Card>
```

### Status Indicators
```tsx
// Status Badges
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
  Active
</Badge>

<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
  Inactive
</Badge>

// Status Dots
<div className="w-2 h-2 rounded-full bg-green-500" title="Active" />
<div className="w-2 h-2 rounded-full bg-red-500" title="Inactive" />

// Icon Status Indicators
{isDeemedPositive ? (
  <TrendingUp className="h-4 w-4 text-green-600" />
) : (
  <TrendingDown className="h-4 w-4 text-red-600" />
)}
```

---

## Interactive Elements

### Button Patterns
```tsx
// Action Button Group
<div className="flex gap-2">
  <Button variant="outline" onClick={handleRefresh} disabled={loading}>
    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
    Refresh
  </Button>
  <Button onClick={handleAdd}>
    <Plus className="h-4 w-4 mr-2" />
    Add New
  </Button>
</div>

// Icon-Only Actions
<div className="flex items-center space-x-2">
  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
    <Edit className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="sm" onClick={() => handleView(item)}>
    <Eye className="h-4 w-4" />
  </Button>
  <Button variant="ghost" size="sm" onClick={() => handleDelete(item)}>
    <Trash2 className="h-4 w-4" />
  </Button>
</div>
```

### Form Patterns
```tsx
// Standard Form Field
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input
    id="field"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="Enter value..."
  />
</div>

// Select Field
<div className="space-y-2">
  <Label htmlFor="select">Select Option</Label>
  <Select value={selected} onValueChange={setSelected}>
    <SelectTrigger>
      <SelectValue placeholder="Choose option..." />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

// Textarea Field
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea
    id="description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    placeholder="Enter description..."
    rows={3}
  />
</div>
```

### Pagination Pattern
```tsx
<div className="flex items-center justify-between px-2">
  <div className="flex-1 text-sm text-muted-foreground">
    Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} entries
  </div>
  <div className="flex items-center space-x-6 lg:space-x-8">
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(pagination.currentPage - 1)}
        disabled={pagination.currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>
      <span className="text-sm font-medium">
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(pagination.currentPage + 1)}
        disabled={pagination.currentPage >= pagination.totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
```

---

## Page Templates

### Master Data Page Template
```tsx
export default function MasterDataPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Master Data</h1>
          <p className="text-muted-foreground">
            Manage master data records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Main Content Card */}
      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>
            View and manage all records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filter Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Records</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {/* Data Table */}
              <Table>
                {/* Table implementation */}
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Transaction Page Template
```tsx
export default function TransactionPage() {
  return (
    <div className="p-6 space-y-6 min-h-screen bg-gradient-subtle">
      {/* Header Card */}
      <Card className="shadow-medium border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Transaction Management
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={openSyncDialog}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync from Tally
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Create Transaction
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters Card */}
      <Card className="shadow-medium border-0">
        <CardContent className="p-4">
          {/* Filter implementation */}
        </CardContent>
      </Card>

      {/* Data Display Card */}
      <Card className="shadow-medium border-0">
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Transaction table/grid */}
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Responsive Design

### Breakpoint Strategy
```css
/* Mobile First Approach */
/* Default styles for mobile (0px and up) */

/* Small tablets (640px and up) */
@media (min-width: 640px) { /* sm */ }

/* Large tablets (768px and up) */
@media (min-width: 768px) { /* md */ }

/* Small desktops (1024px and up) */
@media (min-width: 1024px) { /* lg */ }

/* Large desktops (1280px and up) */
@media (min-width: 1280px) { /* xl */ }
```

### Responsive Patterns
```tsx
// Grid Responsiveness
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Sidebar Responsiveness
<div className="flex flex-col lg:flex-row">
  <div className="w-full lg:w-80 lg:flex-shrink-0">
    {/* Sidebar */}
  </div>
  <div className="flex-1">
    {/* Main content */}
  </div>
</div>

// Table Responsiveness
<div className="overflow-x-auto">
  <Table>
    {/* Table content */}
  </Table>
</div>

// Button Groups
<div className="flex flex-col sm:flex-row gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>

// Search Bar Responsiveness
<div className="hidden md:flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1 w-80 ml-64">
  <Search size={14} className="text-white/70" />
  <Input placeholder="Search..." />
</div>
```

---

## Accessibility Guidelines

### Color Contrast
- Ensure minimum 4.5:1 contrast ratio for normal text
- Ensure minimum 3:1 contrast ratio for large text
- Use `text-muted-foreground` for secondary text (meets contrast requirements)

### Focus States
```tsx
// Custom focus styles
<Button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Accessible Button
</Button>

<Input className="focus:ring-2 focus:ring-primary focus:border-primary">
```

### Semantic HTML
```tsx
// Use proper heading hierarchy
<h1 className="text-3xl font-bold">Main Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<h3 className="text-lg font-medium">Subsection Title</h3>

// Use semantic elements
<main>
  <section>
    <article>
      {/* Content */}
    </article>
  </section>
</main>

// Proper form labels
<Label htmlFor="field-id">Field Label</Label>
<Input id="field-id" />
```

### ARIA Labels
```tsx
// Button with icon only
<Button aria-label="Edit record">
  <Edit className="h-4 w-4" />
</Button>

// Status indicators
<div 
  className="w-2 h-2 rounded-full bg-green-500" 
  title="Active" 
  aria-label="Status: Active"
/>

// Loading states
<div aria-live="polite" aria-busy={loading}>
  {loading ? "Loading..." : "Content loaded"}
</div>
```

---

## Best Practices

### Code Organization
1. **Component Structure**: Keep components focused and reusable
2. **Custom Hooks**: Extract complex logic into custom hooks
3. **Type Safety**: Use TypeScript interfaces for all data structures
4. **Error Handling**: Implement consistent error boundaries and states

### Performance Optimization
1. **Lazy Loading**: Use React.lazy() for code splitting
2. **Memoization**: Use React.memo() for expensive components
3. **Virtual Scrolling**: For large data sets
4. **Image Optimization**: Proper sizing and lazy loading

### Design Consistency
1. **Component Variants**: Use shadcn variants instead of custom CSS
2. **Spacing**: Use Tailwind spacing scale consistently
3. **Colors**: Always use CSS variables, never hardcoded colors
4. **Icons**: Use Lucide React icons consistently

### Testing Guidelines
1. **Accessibility Testing**: Test with screen readers
2. **Mobile Testing**: Test on various device sizes
3. **Performance Testing**: Monitor loading times and interactions
4. **Cross-browser Testing**: Ensure compatibility across browsers

### Documentation Requirements
1. **Component Documentation**: Document props and usage examples
2. **Design Tokens**: Document custom CSS variables
3. **API Integration**: Document data structures and error states
4. **User Workflows**: Document complex user interactions

---

## Design System Maintenance

### Version Control
- All design changes should be documented
- CSS variables should be version controlled
- Component API changes require documentation updates

### Review Process
- All UI changes require design system review
- New components must follow established patterns
- Color additions require accessibility testing

### Evolution Guidelines
- Design system should evolve based on user feedback
- Regular audits for consistency and performance
- Documentation should be updated with each release

---

This design guide serves as the comprehensive reference for all Tally workspace UI development. Follow these guidelines to ensure consistency, accessibility, and professional quality across all Tally-related interfaces.