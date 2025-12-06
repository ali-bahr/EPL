import { Link } from "wouter";
import { Trophy, Users, Calendar, Ticket, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container px-4 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Egyptian Premier League</span>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              Reserve Your Seats for
              <span className="text-primary block mt-2">Unforgettable Matches</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
              Experience the thrill of Egyptian football live. Book your VIP seats for upcoming 
              matches and be part of the action.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/matches">
                <Button size="lg" className="gap-2 min-w-[180px]" data-testid="button-view-matches">
                  View Matches
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {!user && (
                <Link href="/register">
                  <Button size="lg" variant="outline" className="min-w-[180px]" data-testid="button-get-started">
                    Get Started
                  </Button>
                </Link>
              )}
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Join 10,000+ football fans already using our platform
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get your match tickets in just a few simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="overflow-visible">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Create Account</h3>
                <p className="text-sm text-muted-foreground">
                  Sign up as a fan to start reserving seats for your favorite matches.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-visible">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Browse Matches</h3>
                <p className="text-sm text-muted-foreground">
                  Explore upcoming Egyptian Premier League matches and find your game.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-visible">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Select Seats</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred seats from our interactive VIP lounge map.
                </p>
              </CardContent>
            </Card>

            <Card className="overflow-visible">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Get Your Ticket</h3>
                <p className="text-sm text-muted-foreground">
                  Complete payment and receive your unique reservation ticket instantly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/50">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">18</div>
              <p className="text-muted-foreground">Teams Competing</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">100+</div>
              <p className="text-muted-foreground">Matches Per Season</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-heading font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Seats Available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto text-center">
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4">
            Ready to Experience the Thrill?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Don't miss out on the excitement. Reserve your seats today and be part of 
            the Egyptian Premier League action.
          </p>
          <Link href={user ? "/matches" : "/register"}>
            <Button size="lg" className="gap-2" data-testid="button-cta-bottom">
              {user ? "Browse Matches" : "Join Now"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 border-t">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-heading font-bold">EPL Tickets</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Egyptian Premier League Match Reservation System
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
