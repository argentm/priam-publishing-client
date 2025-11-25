import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ThemePreviewPage() {
  return (
    <div className="container mx-auto py-12 space-y-12">
      {/* Hero Section with Gradient */}
      <div className="gradient-daring rounded-2xl p-12 text-center text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-6xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            PRIAM DIGITAL
          </h1>
          <p className="text-2xl opacity-90 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            Daring Artist Theme
          </p>
          <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <Button variant="secondary" size="lg" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">Explore Components</Button>
            <Button variant="outline" size="lg" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
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
            <div className="text-4xl font-bold text-[hsl(300,100%,81%)]">5+</div>
            <p className="text-sm text-muted-foreground mt-2">Glass Effects</p>
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
              <p className="text-sm font-medium mb-3">Colorful Variants</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Gradient</Button>
                <Button variant="default">Orange</Button>
                <Button variant="secondary">Purple</Button>
                <Button variant="outline">Blue</Button>
              </div>
            </div>
            <div className="gradient-daring rounded-lg p-6">
              <p className="text-sm font-medium mb-3 text-white">Glass Buttons</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" className="bg-white/10 backdrop-blur-sm">Glass Effect</Button>
                <Button variant="secondary" size="lg" className="bg-white/10 backdrop-blur-sm">Large Glass</Button>
                <Button variant="secondary" size="sm" className="bg-white/10 backdrop-blur-sm">Small Glass</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Elements */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input components with focus states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {/* Modern Glassmorphism */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Modern Glassmorphism</h2>
        
        <div className="gradient-daring rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-white">Classic Glass</CardTitle>
                <CardDescription className="text-white/80">Enhanced blur and saturation</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-sm">
                  Modern glassmorphism with 20px blur and 180% saturation for a crisp, contemporary look.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-gradient-border border-0">
              <CardHeader>
                <CardTitle className="text-white">Gradient Border</CardTitle>
                <CardDescription className="text-white/80">Colorful edge effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/90 text-sm">
                  Glass card with animated gradient border for extra flair.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="gradient-sunset rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
            <Card className="glass-orange border-0 w-full">
              <CardContent className="pt-6">
                <h3 className="text-white font-bold text-center">Orange Glass</h3>
              </CardContent>
            </Card>
          </div>

          <div className="gradient-martinique rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
            <Card className="glass-purple border-0 w-full">
              <CardContent className="pt-6">
                <h3 className="text-white font-bold text-center">Purple Glass</h3>
              </CardContent>
            </Card>
          </div>

          <div className="gradient-ocean rounded-2xl p-8 min-h-[200px] flex items-center justify-center">
            <Card className="glass-blue border-0 w-full">
              <CardContent className="pt-6">
                <h3 className="text-white font-bold text-center">Blue Glass</h3>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

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
                <p><code className="bg-muted px-2 py-1 rounded">variant="default"</code> - Orange primary button</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="default"</code> - Primary button</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="default"</code> - Primary orange</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="secondary"</code> - Secondary button</p>
              </div>
              <div className="space-y-1">
                <p><code className="bg-muted px-2 py-1 rounded">variant="outline"</code> - Outline style</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="secondary"</code> + glass classes - Glassmorphism</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="secondary"</code> - Malibu blue</p>
                <p><code className="bg-muted px-2 py-1 rounded">variant="outline"</code> - Bordered</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-lg">Glassmorphism Classes</h3>
            <ul className="space-y-2 text-sm">
              <li><code className="bg-muted px-2 py-1 rounded">.glass-card</code> - Modern glass with 20px blur</li>
              <li><code className="bg-muted px-2 py-1 rounded">.glass-orange</code> - Orange tinted glass</li>
              <li><code className="bg-muted px-2 py-1 rounded">.glass-purple</code> - Purple tinted glass</li>
              <li><code className="bg-muted px-2 py-1 rounded">.glass-blue</code> - Blue tinted glass</li>
              <li><code className="bg-muted px-2 py-1 rounded">.glass-gradient-border</code> - Glass with gradient border</li>
            </ul>
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
              <pre className="text-xs overflow-x-auto">{`<Button variant="default" size="lg">
  Get Started
</Button>

<Card className="card-orange hover-lift">
  <CardContent>
    Colorful card with hover effect
  </CardContent>
</Card>

<div className="gradient-daring p-8">
  <Card className="glass-card">
    Glass card on gradient
  </Card>
</div>

<h1 className="gradient-text text-5xl font-bold">
  PRIAM Digital
</h1>

<div className="neon-orange rounded-lg p-6">
  Glowing content
</div>`}</pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

