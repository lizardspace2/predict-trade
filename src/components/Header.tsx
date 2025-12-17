import { Search, Menu, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { ConnectWallet } from "@/components/ConnectWallet";

const navItems = [
  { label: "Trending", icon: TrendingUp, href: "/" },
  { label: "Politics", href: "/?category=Politics" },
  { label: "Crypto", href: "/?category=Crypto" },
  { label: "Sports", href: "/?category=Sports" },
  { label: "Tech", href: "/?category=Tech" },
  { label: "Finance", href: "/?category=Finance" },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden font-display text-xl font-bold sm:inline-block">
            PredictX
          </span>
        </Link>

        {/* Search */}
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search markets..."
              className="h-10 w-full rounded-full border-border bg-secondary pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {item.icon && <item.icon className="h-4 w-4" />}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ConnectWallet />
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
