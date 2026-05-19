import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GameProvider } from "@/context/GameContext";
import { XPProvider, useXP } from "@/context/XPContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GamePage from "@/pages/Game";
import Tutorial from "@/pages/Tutorial";
import Contact from "@/pages/Contact";
import Finance from "@/pages/Finance";
import Leaderboard from "@/pages/Leaderboard";
import Premium from "@/pages/Premium";
import Admin from "@/pages/Admin";
import { useEffect } from "react";

const queryClient = new QueryClient();

function PremiumSync() {
  const { isPremium, premiumTrialEndsAt } = useAuth();
  const { setPremiumOverride } = useXP();
  const isPremiumActive = isPremium && premiumTrialEndsAt && premiumTrialEndsAt > Date.now();
  
  useEffect(() => {
    setPremiumOverride(isPremiumActive);
  }, [isPremiumActive, setPremiumOverride]);
  
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/game" component={GamePage} />
      <Route path="/tutorial" component={Tutorial} />
      <Route path="/contact" component={Contact} />
      <Route path="/finance" component={Finance} />
      <Route path="/premium" component={Premium} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <XPProvider>
              <PremiumSync />
              <FinanceProvider>
                <GameProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}> 
                    <Router />
                  </WouterRouter>
                </GameProvider>
              </FinanceProvider>
            </XPProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
