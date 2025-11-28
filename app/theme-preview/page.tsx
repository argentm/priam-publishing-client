import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, ArrowRight, Download, Settings, Loader2, BadgeCheck, AlertCircle, Clock } from 'lucide-react';

export default function ThemePreviewPage() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      {/* Hero Section with Gradient */}
      <div className="gradient-daring rounded-2xl p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 gradient-text">
            PRIAM DIGITAL
          </h1>
          <p className="text-2xl opacity-90 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Daring Artist Theme
          </p>
          <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-white/90 font-semibold shadow-lg">
              Explore Components
            </Button>
            <Button size="lg" className="bg-white/20 text-white border-2 border-white/50 hover:bg-white/30 font-semibold backdrop-blur-sm">
              View Docs
            </Button>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="card-orange hover-lift cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-[hsl(16,100%,59%)]">10+</div>
            <p className="text-sm text-muted-foreground mt-2">Button Variants</p>
          </CardContent>
        </Card>
        <Card className="card-purple hover-lift cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-[hsl(300,100%,81%)]">6+</div>
            <p className="text-sm text-muted-foreground mt-2">Gradients</p>
          </CardContent>
        </Card>
        <Card className="card-blue hover-lift cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold text-[hsl(202,100%,72%)]">8+</div>
            <p className="text-sm text-muted-foreground mt-2">Card Variants</p>
          </CardContent>
        </Card>
        <Card className="hover-lift cursor-pointer border-2 border-primary">
          <CardContent className="pt-6 text-center">
            <div className="text-4xl font-bold gradient-text">∞</div>
            <p className="text-sm text-muted-foreground mt-2">Combinations</p>
          </CardContent>
        </Card>
      </div>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Color Palette</CardTitle>
          <CardDescription>Your vibrant, daring color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-[#2c2b47] flex items-center justify-center text-white font-bold">
                Martinique
              </div>
              <p className="text-sm text-center">#2c2b47</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-[#ff5f2e] flex items-center justify-center text-white font-bold">
                Outrageous Orange
              </div>
              <p className="text-sm text-center">#ff5f2e</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-[#ff9fff] flex items-center justify-center text-[#2c2b47] font-bold">
                Lavender Rose
              </div>
              <p className="text-sm text-center">#ff9fff</p>
            </div>
            <div className="space-y-2">
              <div className="h-24 rounded-lg bg-[#73c7ff] flex items-center justify-center text-white font-bold">
                Malibu
              </div>
              <p className="text-sm text-center">#73c7ff</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography System */}
      <Card>
        <CardHeader>
          <CardTitle>Typography System</CardTitle>
          <CardDescription>Playfair Display + Source Sans 3 - Creative Display pairing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-12">
          {/* Font Stack Overview */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Font</p>
              <h3 className="font-display text-4xl font-bold">Playfair Display</h3>
              <p className="text-sm text-muted-foreground">Headlines, hero text, pull quotes</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Body Font</p>
              <h3 className="font-body text-4xl font-semibold">Source Sans 3</h3>
              <p className="text-sm text-muted-foreground">Paragraphs, UI, navigation</p>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mono Font</p>
              <h3 className="font-mono text-4xl">Geist Mono</h3>
              <p className="text-sm text-muted-foreground">Code, ISRCs, timestamps</p>
            </div>
          </div>

          {/* Size Jumps - Dramatic Hierarchy */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Size Jumps (3x+)</p>
              <div className="space-y-4">
                <h1 className="font-display text-8xl md:text-9xl font-black tracking-tight leading-none">
                  Giant
                </h1>
                <h2 className="font-display text-4xl font-bold">
                  Section Header
                </h2>
                <p className="text-base font-body">
                  Body text at standard size. The jump from 144px to 36px creates dramatic visual hierarchy.
                </p>
              </div>
            </div>
          </div>

          {/* Weight Extremes */}
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weight Extremes (200 vs 900)</p>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="font-body text-3xl font-extralight">Extra Light 200</p>
                <p className="font-body text-3xl font-light">Light 300</p>
                <p className="font-body text-3xl font-normal">Regular 400</p>
                <p className="font-body text-3xl font-medium">Medium 500</p>
              </div>
              <div className="space-y-4">
                <p className="font-body text-3xl font-semibold">Semibold 600</p>
                <p className="font-body text-3xl font-bold">Bold 700</p>
                <p className="font-body text-3xl font-extrabold">Extrabold 800</p>
                <p className="font-body text-3xl font-black">Black 900</p>
              </div>
            </div>
          </div>

          {/* Display Font Weights */}
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Display Font Weights</p>
            <div className="space-y-2">
              <h2 className="font-display text-5xl font-normal">Playfair Regular</h2>
              <h2 className="font-display text-5xl font-semibold">Playfair Semibold</h2>
              <h2 className="font-display text-5xl font-bold">Playfair Bold</h2>
              <h2 className="font-display text-5xl font-black">Playfair Black</h2>
            </div>
          </div>

          {/* Font Pairing Example */}
          <div className="gradient-martinique rounded-2xl p-8 md:p-12 text-white">
            <h2 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Music Publishing,<br />Reimagined
            </h2>
            <p className="font-body text-xl md:text-2xl font-light opacity-90 max-w-2xl mb-8">
              Elegant serif headlines paired with clean sans-serif body text creates
              the sophisticated editorial feel perfect for the music industry.
            </p>
            <div className="flex gap-4">
              <Button className="bg-white text-[#2c2b47] hover:bg-white/90 font-semibold">
                Get Started
              </Button>
              <Button variant="outline" className="border-white/50 text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>

          {/* Mono Font / Code Example */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mono Font for Technical Data</p>
            <div className="bg-[#2c2b47] rounded-xl p-6 font-mono text-white">
              <div className="space-y-2 text-sm">
                <p><span className="text-[#73c7ff]">ISWC:</span> T-345.246.800-1</p>
                <p><span className="text-[#73c7ff]">ISRC:</span> USRC17607839</p>
                <p><span className="text-[#ff9fff]">CAE/IPI:</span> 00892347865</p>
                <p><span className="text-[#ff5f2e]">Created:</span> 2024-01-15T14:32:00Z</p>
              </div>
            </div>
          </div>

          {/* Typography Classes Reference */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Typography Classes</p>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <p><code className="bg-muted px-2 py-1 rounded font-mono">.font-display</code></p>
                <p className="text-muted-foreground">Playfair Display</p>
              </div>
              <div className="space-y-2">
                <p><code className="bg-muted px-2 py-1 rounded font-mono">.font-body</code></p>
                <p className="text-muted-foreground">Source Sans 3</p>
              </div>
              <div className="space-y-2">
                <p><code className="bg-muted px-2 py-1 rounded font-mono">.font-mono</code></p>
                <p className="text-muted-foreground">Geist Mono</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Colorful Cards - Mercury-inspired */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Mercury-Style Colorful Cards</h2>
        <p className="text-muted-foreground mb-6">Clean, minimal borders with subtle color accents</p>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-orange hover-lift">
            <CardHeader>
              <CardTitle>Orange Card</CardTitle>
              <CardDescription>Warm and energetic</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Subtle orange gradient with minimal border for a clean, modern look.
              </p>
              <Button variant="default">Learn More</Button>
            </CardContent>
          </Card>

          <Card className="card-purple hover-lift">
            <CardHeader>
              <CardTitle>Purple Card</CardTitle>
              <CardDescription>Creative and unique</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Soft purple tones with Mercury-inspired minimalism.
              </p>
              <Button variant="secondary">Explore</Button>
            </CardContent>
          </Card>

          <Card className="card-blue hover-lift">
            <CardHeader>
              <CardTitle>Blue Card</CardTitle>
              <CardDescription>Trust and reliability</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Clean blue accents perfect for professional content.
              </p>
              <Button variant="outline">Discover</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Clean Mercury-style cards */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Clean Cards</h2>
        <p className="text-muted-foreground mb-6">Pure Mercury aesthetic - minimal and elegant</p>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="card-clean">
            <CardHeader>
              <CardTitle>Clean Card</CardTitle>
              <CardDescription>Minimal and elegant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Mercury-inspired clean design with subtle hover effects.
              </p>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardHeader>
              <CardTitle>Simple Layout</CardTitle>
              <CardDescription>Focus on content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No distractions, just clean lines and great content.
              </p>
            </CardContent>
          </Card>

          <Card className="card-clean">
            <CardHeader>
              <CardTitle>Professional</CardTitle>
              <CardDescription>Business-ready</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Perfect for dashboards and data presentation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Neon Effects */}
      <Card>
        <CardHeader>
          <CardTitle>Neon Glow Effects</CardTitle>
          <CardDescription>Animated glowing elements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="neon-orange rounded-lg p-6 bg-[hsl(16,100%,59%)] text-white text-center">
              <h3 className="font-bold">Orange Glow</h3>
            </div>
            <div className="neon-purple rounded-lg p-6 bg-[hsl(300,100%,81%)] text-[hsl(240,16%,17%)] text-center">
              <h3 className="font-bold">Purple Glow</h3>
            </div>
            <div className="neon-blue rounded-lg p-6 bg-[hsl(202,100%,72%)] text-white text-center">
              <h3 className="font-bold">Blue Glow</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Showcase */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Colorful Buttons</CardTitle>
            <CardDescription>Modern, vibrant button styles with hover effects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Standard Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Sizes</p>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg">Large</Button>
                <Button>Default</Button>
                <Button size="sm">Small</Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Icon Buttons</p>
              <div className="flex flex-wrap gap-3">
                <Button><Plus className="mr-2 h-4 w-4" /> Create New</Button>
                <Button variant="secondary">Continue <ArrowRight className="ml-2 h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Settings className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Loading States</p>
              <div className="flex flex-wrap gap-3">
                <Button disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</Button>
                <Button variant="secondary" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators and counts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Standard Variants</p>
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">With Icons</p>
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-green-600"><BadgeCheck className="mr-1 h-3 w-3" /> Verified</Badge>
                <Badge variant="destructive"><AlertCircle className="mr-1 h-3 w-3" /> Error</Badge>
                <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Count Badges</p>
              <div className="flex flex-wrap gap-3">
                <Badge className="h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums">8</Badge>
                <Badge variant="destructive" className="h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums">99</Badge>
                <Badge variant="outline" className="h-5 min-w-5 rounded-full px-1.5 font-mono tabular-nums">20+</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input components with focus and disabled states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm font-medium mb-3">Required</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="John Doe" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-3">Non-required</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email-disabled" className="text-muted-foreground">Email (Disabled)</Label>
                <Input id="email-disabled" type="email" value="locked@example.com" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name-readonly" className="text-muted-foreground">Name (Read-only)</Label>
                <Input id="name-readonly" type="text" value="Cannot Edit" readOnly />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gradient Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Gradient Backgrounds</CardTitle>
          <CardDescription>Ready-to-use gradient combinations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="gradient-daring h-32 rounded-lg flex items-center justify-center text-white font-bold">
              Daring Artist
            </div>
            <div className="gradient-martinique h-32 rounded-lg flex items-center justify-center text-white font-bold">
              Martinique
            </div>
            <div className="gradient-sunset h-32 rounded-lg flex items-center justify-center text-white font-bold">
              Sunset
            </div>
            <div className="gradient-ocean h-32 rounded-lg flex items-center justify-center text-white font-bold">
              Ocean
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Animated Gradient Text */}
      <Card>
        <CardHeader>
          <CardTitle>Animated Text</CardTitle>
          <CardDescription>Gradient text effects</CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-5xl font-bold gradient-text text-center py-8">
            PRIAM DIGITAL
          </h2>
        </CardContent>
      </Card>

      {/* Usage Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Usage Guide</CardTitle>
          <CardDescription>All classes and variants for the Daring Artist theme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3 text-lg">Button Variants</h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <div className="space-y-1">
                <p><code className="bg-muted px-2 py-1 rounded">variant="default"</code> - Primary orange button</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="secondary"</code> - Secondary purple</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="outline"</code> - Bordered outline</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="destructive"</code> - Destructive red</p>
              </div>
              <div className="space-y-1">
                <p><code className="bg-muted px-2 py-1 rounded">variant="ghost"</code> - Ghost button</p>
                <p><code className="bg-muted px-2 py-1 rounded">size="icon"</code> - Icon-only button</p>
                <p><code className="bg-muted px-2 py-1 rounded">size="lg"</code> - Large button</p>
                <p><code className="bg-muted px-2 py-1 rounded">size="sm"</code> - Small button</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Colorful Card Classes</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-muted px-2 py-1 rounded">.card-orange</code> - Orange gradient card with hover</li>
              <li><code className="bg-muted px-2 py-1 rounded">.card-purple</code> - Purple gradient card with hover</li>
              <li><code className="bg-muted px-2 py-1 rounded">.card-blue</code> - Blue gradient card with hover</li>
              <li><code className="bg-muted px-2 py-1 rounded">.hover-lift</code> - Lift and scale on hover</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Neon Glow Effects</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-muted px-2 py-1 rounded">.neon-orange</code> - Animated orange glow</li>
              <li><code className="bg-muted px-2 py-1 rounded">.neon-purple</code> - Animated purple glow</li>
              <li><code className="bg-muted px-2 py-1 rounded">.neon-blue</code> - Animated blue glow</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Gradient Backgrounds</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-muted px-2 py-1 rounded">.gradient-daring</code> - Orange → Purple → Blue</li>
              <li><code className="bg-muted px-2 py-1 rounded">.gradient-martinique</code> - Dark navy gradient</li>
              <li><code className="bg-muted px-2 py-1 rounded">.gradient-sunset</code> - Orange → Purple</li>
              <li><code className="bg-muted px-2 py-1 rounded">.gradient-ocean</code> - Blue → Purple</li>
              <li><code className="bg-muted px-2 py-1 rounded">.gradient-text</code> - Animated gradient text</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Example Usage</h3>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-xs overflow-x-auto">{`// Icon button with loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>

// Colorful card with hover effect
<Card className="card-orange hover-lift">
  <CardContent>Content here</CardContent>
</Card>

// Animated gradient text
<h1 className="gradient-text text-5xl font-bold">
  PRIAM Digital
</h1>

// Gradient background
<div className="gradient-daring p-8 rounded-xl">
  Hero content
</div>`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

