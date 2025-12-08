import { Link, useLocation } from "wouter";
import { LogOut, User, Menu, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      default:
        return "secondary";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Site Admin";
      case "manager":
        return "EFA Manager";
      default:
        return "Fan";
    }
  };

  const navLinks = user ? getNavLinks(user.role) : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4 px-4 mx-auto">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <nav className="flex flex-col gap-2 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={location === link.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="font-heading font-bold text-lg hidden sm:inline-block" data-testid="text-logo">
              EPL Tickets
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={location === link.href ? "secondary" : "ghost"}
                size="sm"
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{user.firstName}</span>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="hidden sm:inline-flex">
                    {getRoleLabel(user.role)}
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium" data-testid="text-user-fullname">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid="text-user-email">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                {user.role === "fan" && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile" data-testid="link-profile">
                      <User className="mr-2 h-4 w-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" data-testid="link-login">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" data-testid="link-register">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getNavLinks(role: string) {
  const commonLinks = [{ href: "/matches", label: "Browse Matches" }];

  switch (role) {
    case "admin":
      return [
        { href: "/admin", label: "Admin Dashboard" },
        { href: "/admin/users", label: "Users" },
      ];
    case "manager":
      return [
        { href: "/manager", label: "Dashboard" },
        { href: "/manager/matches", label: "Manage Matches" },
        { href: "/manager/stadiums", label: "Stadiums" },
        ...commonLinks,
      ];
    case "fan":
      return [
        { href: "/dashboard", label: "My Reservations" },
        ...commonLinks,
      ];
    default:
      return commonLinks;
  }
}
