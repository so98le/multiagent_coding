import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, Tab } from "@/components/ui/tabs"
import { CodeMockupCard } from "@/components/ui/code"
import { HeroBand, Section, CTABanner, Container } from "@/components/ui/layout"

export default function DesignShowcase() {
  return (
    <main className="min-h-screen bg-canvas">
      {/* Promo Banner */}
      <div className="bg-brand-teal-deep text-on-dark text-body-sm-medium py-2 px-4 text-center">
        🚀 Check out MongoDB Atlas — the multi-cloud developer data platform{" "}
        <a href="#" className="text-brand-green hover:underline">
          Try free →
        </a>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-canvas border-b border-hairline">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-heading-4 font-medium text-brand-green">🍃 MongoDB</span>
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-body-sm text-ink hover:text-brand-green-dark">Products</a>
                <a href="#" className="text-body-sm text-ink hover:text-brand-green-dark">Solutions</a>
                <a href="#" className="text-body-sm text-ink hover:text-brand-green-dark">Resources</a>
                <a href="#" className="text-body-sm text-ink hover:text-brand-green-dark">Pricing</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">Sign In</Button>
              <Button size="sm">Try Free</Button>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <HeroBand variant="dark">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-hero-display text-on-dark text-balance">
              One data platform.{" "}
              <span className="text-brand-green">Unlimited</span> AI potential.
            </h1>
            <p className="text-subtitle text-on-dark-muted max-w-lg">
              Build faster with the most versatile developer data platform. 
              Scale confidently with built-in security and availability.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="on-dark">Try Free</Button>
              <Button variant="secondary-on-dark">Contact Sales</Button>
            </div>
          </div>
          <div className="hidden lg:block">
            <CodeMockupCard title="MongoDB Atlas">
{`const client = new MongoClient(uri);
await client.connect();

const db = client.db("myApp");
const users = await db
  .collection("users")
  .find({ status: "active" })
  .toArray();

console.log(users);`}
            </CodeMockupCard>
          </div>
        </div>
      </HeroBand>

      {/* Tabs Demo */}
      <Section>
        <div className="space-y-8">
          <h2 className="text-heading-2 text-ink">Tab Styles</h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-body-sm text-slate mb-3">Pill Tabs (default)</p>
              <Tabs variant="pill">
                <Tab active>MongoDB Atlas</Tab>
                <Tab>Enterprise Advanced</Tab>
                <Tab>Community Edition</Tab>
              </Tabs>
            </div>
            
            <div>
              <p className="text-body-sm text-slate mb-3">Segmented Tabs</p>
              <Tabs variant="segmented">
                <Tab variant="segmented" active>Overview</Tab>
                <Tab variant="segmented">Features</Tab>
                <Tab variant="segmented">Pricing</Tab>
                <Tab variant="segmented">Documentation</Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </Section>

      {/* Buttons Demo */}
      <Section variant="tight" className="bg-surface">
        <div className="space-y-8">
          <h2 className="text-heading-2 text-ink">Button Variants</h2>
          
          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="link">Link Style</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
          
          <div className="p-6 bg-brand-teal-deep rounded-lg flex flex-wrap gap-4">
            <Button variant="on-dark">On Dark Primary</Button>
            <Button variant="secondary-on-dark">On Dark Secondary</Button>
          </div>
        </div>
      </Section>

      {/* Badges Demo */}
      <Section>
        <div className="space-y-8">
          <h2 className="text-heading-2 text-ink">Badge Variants</h2>
          
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="success">Free Tier</Badge>
            <Badge variant="popular">Most Popular</Badge>
            <Badge variant="purple">Database</Badge>
            <Badge variant="orange">Search</Badge>
            <Badge variant="blue">Cloud</Badge>
            <Badge variant="pink">AI/ML</Badge>
            <Badge variant="teal">Security</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Error</Badge>
          </div>
        </div>
      </Section>

      {/* Cards Demo */}
      <Section variant="tight" className="bg-surface">
        <div className="space-y-8">
          <h2 className="text-heading-2 text-ink">Card Variants</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Default Card */}
            <Card>
              <CardHeader>
                <Badge variant="purple" className="w-fit mb-2">Database</Badge>
                <CardTitle>Introduction to MongoDB</CardTitle>
                <CardDescription>
                  Learn the fundamentals of MongoDB and document databases.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-slate">8 lessons • 2 hours</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0">Get Started →</Button>
              </CardFooter>
            </Card>

            {/* Feature Card */}
            <Card variant="feature">
              <CardHeader>
                <Badge variant="orange" className="w-fit mb-2">Search</Badge>
                <CardTitle>Atlas Search</CardTitle>
                <CardDescription>
                  Build rich search experiences with native full-text search capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-slate">Advanced • 4 hours</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0">Learn more →</Button>
              </CardFooter>
            </Card>

            {/* Featured Card */}
            <Card variant="featured">
              <CardHeader>
                <Badge variant="popular" className="w-fit mb-2">Most Popular</Badge>
                <CardTitle>MongoDB for AI</CardTitle>
                <CardDescription>
                  Build AI-powered applications with MongoDB&apos;s vector search.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-slate">12 lessons • 5 hours</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0">Start learning →</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Section>

      {/* Pricing Cards */}
      <Section>
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-heading-2 text-ink">Pricing</h2>
            <p className="text-subtitle text-slate">Choose the plan that&apos;s right for you</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>Perfect for learning and prototyping</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-heading-2 text-ink">$0</span>
                  <span className="text-body-sm text-slate">/month</span>
                </div>
                <ul className="space-y-2 text-body-sm text-slate">
                  <li>✓ 512MB Storage</li>
                  <li>✓ Shared RAM</li>
                  <li>✓ Always Free</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">Get Started</Button>
              </CardFooter>
            </Card>

            {/* Flex Tier - Featured */}
            <Card variant="featured" className="relative">
              <Badge variant="popular" className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle>Flex</CardTitle>
                <CardDescription>Pay only for what you use</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-heading-2 text-ink">$0.10</span>
                  <span className="text-body-sm text-slate">/GB-hour</span>
                </div>
                <ul className="space-y-2 text-body-sm text-slate">
                  <li>✓ Scalable Storage</li>
                  <li>✓ Auto-scaling</li>
                  <li>✓ No commitment</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Start Free</Button>
              </CardFooter>
            </Card>

            {/* Dedicated Tier */}
            <Card className="relative">
              <CardHeader>
                <CardTitle>Dedicated</CardTitle>
                <CardDescription>For production workloads</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <span className="text-heading-2 text-ink">$57</span>
                  <span className="text-body-sm text-slate">/month</span>
                </div>
                <ul className="space-y-2 text-body-sm text-slate">
                  <li>✓ Dedicated resources</li>
                  <li>✓ Advanced security</li>
                  <li>✓ 24/7 support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Section>

      {/* Input Demo */}
      <Section variant="tight" className="bg-surface">
        <div className="space-y-8">
          <h2 className="text-heading-2 text-ink">Input Variants</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-body-sm-medium text-ink">Default Input</label>
              <Input placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <label className="text-body-sm-medium text-ink">Search Input</label>
              <Input variant="search" placeholder="Search courses..." />
            </div>
            <div className="space-y-2">
              <label className="text-body-sm-medium text-ink">Large Search</label>
              <Input variant="search-large" placeholder="What do you want to learn?" />
            </div>
          </div>
        </div>
      </Section>

      {/* CTA Banner */}
      <Section>
        <CTABanner>
          <h2 className="text-display-lg text-on-dark mb-4 text-balance">
            Ready to get started?
          </h2>
          <p className="text-subtitle text-on-dark-muted mb-6 max-w-2xl mx-auto">
            Deploy a free cluster with MongoDB Atlas and start building today.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="on-dark">Try Free</Button>
            <Button variant="secondary-on-dark">Contact Sales</Button>
          </div>
        </CTABanner>
      </Section>

      {/* Footer */}
      <footer className="bg-brand-teal-deep py-16">
        <Container>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            <div className="col-span-2 lg:col-span-1">
              <span className="text-heading-4 font-medium text-brand-green">🍃 MongoDB</span>
            </div>
            {["Products", "Solutions", "Resources", "Company", "Support"].map((section) => (
              <div key={section}>
                <h4 className="text-body-sm-medium text-on-dark mb-4">{section}</h4>
                <ul className="space-y-2">
                  {["Link 1", "Link 2", "Link 3"].map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-body-sm text-on-dark-muted hover:text-on-dark">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-hairline-dark text-body-sm text-on-dark-muted">
            © 2024 MongoDB, Inc. All rights reserved.
          </div>
        </Container>
      </footer>
    </main>
  )
}
