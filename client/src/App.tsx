import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { Header } from "@/components/header";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Matches from "@/pages/matches";
import MatchDetails from "@/pages/match-details";
import MatchReserve from "@/pages/match-reserve";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminUsers from "@/pages/admin/users";
import ManagerDashboard from "@/pages/manager/dashboard";
import ManagerMatches from "@/pages/manager/matches";
import MatchForm from "@/pages/manager/match-form";
import ManagerStadiums from "@/pages/manager/stadiums";
import StadiumForm from "@/pages/manager/stadium-form";
import ManagerReferees from "@/pages/manager/referees";
import ManagerLinesmen from "@/pages/manager/linesmen";
import ManagerTeams from "@/pages/manager/teams";
import CustomerDashboard from "@/pages/customer/dashboard";
import ReservationDetail from "@/pages/reservation-detail";
import Profile from "@/pages/profile";

function ProtectedRoute({ 
  children, 
  roles 
}: { 
  children: React.ReactNode; 
  roles?: string[]; 
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  console.log("User: ", user)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
    console.log("Check if the user is logged in")

  if (!user) {
    console.log("No user loggedd in, redirecting to login")
    setLocation("/login");
    return null;
  }

  // Check if user status field eFxists and is not approved
  // Backend might not have a status field, or it might be named differently
  if (user.status && user.status !== "approved") {
    return (
      <div className="container px-4 py-8 mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Account Not Approved</h1>
        <p className="text-muted-foreground">
          Your account is still pending approval. Please wait for an administrator to approve your account.
        </p>
      </div>
    );
  }

  if (roles && roles.length > 0 && !roles.includes(user.role || '')) {
    setLocation("/");
    return null;
  }

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // user.roles: ['Admin', 'Fan']
  if (user) {
    switch (user.role) {
      case "admin":
        setLocation("/admin");
        break;
      case "manager":
        setLocation("/manager");
        break;
      default:
        setLocation("/dashboard");
    }
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      <Route path="/login">
        <GuestRoute>
          <Login />
        </GuestRoute>
      </Route>
      
      <Route path="/register">
        <GuestRoute>
          <Register />
        </GuestRoute>
      </Route>
      
      <Route path="/matches" component={Matches} />
      <Route path="/matches/:id" component={MatchDetails} />
      
      <Route path="/matches/:id/reserve">
        <ProtectedRoute roles={["fan"]}>
          <MatchReserve />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard">
        <ProtectedRoute roles={["fan"]}>
          <CustomerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/reservation/:id">
        <ProtectedRoute roles={["fan"]}>
          <ReservationDetail />
        </ProtectedRoute>
      </Route>
      
      <Route path="/profile">
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin">
        <ProtectedRoute roles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/users">
        <ProtectedRoute roles={["admin"]}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager">
        <ProtectedRoute roles={["admin", "manager"]}>
          <ManagerDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/matches">
        <ProtectedRoute roles={["admin", "manager"]}>
          <ManagerMatches />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/matches/new">
        <ProtectedRoute roles={["admin", "manager"]}>
          <MatchForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/matches/:id/edit">
        <ProtectedRoute roles={["admin", "manager"]}>
          <MatchForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/stadiums">
        <ProtectedRoute roles={["admin", "manager"]}>
          <ManagerStadiums />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/stadiums/new">
        <ProtectedRoute roles={["admin", "manager"]}>
          <StadiumForm />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/referees">
        <ProtectedRoute roles={["admin", "manager"]}>
          <ManagerReferees />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/linesmen">
        <ProtectedRoute roles={["admin", "manager"]}>
          <ManagerLinesmen />
        </ProtectedRoute>
      </Route>
      
      <Route path="/manager/teams">
        <ProtectedRoute roles={["admin", "manager"]}>
          <ManagerTeams />
        </ProtectedRoute>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="min-h-screen bg-background">
              <Header />
              <Router />
            </div>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
