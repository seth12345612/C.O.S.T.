import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GameProvider } from "@/context/GameContext";
import { XPProvider, useXP } from "@/context/XPContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AchievementProvider } from "@/context/AchievementContext";
import { AchievementNotification } from "@/components/AchievementNotification";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { NicknameModal } from "@/components/NicknameModal";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GamePage from "@/pages/Game";
import Tutorial from "@/pages/Tutorial";
import Contact from "@/pages/Contact";
import Finance from "@/pages/Finance";
import Leaderboard from "@/pages/Leaderboard";
import Premium from "@/pages/Premium";
import Admin from "@/pages/Admin";
import Despre from "@/pages/Despre";
import Achievements from "@/pages/Achievements";
import Login from "@/pages/Login";
import PaymentSuccess from "@/pages/PaymentSuccess";
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
      <Route path="/despre" component={Despre} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/login" component={Login} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <XPProvider>
            <AchievementProvider>
              <PremiumSync />
              <AchievementNotification />
              <NicknameModal />
              <FinanceProvider>
                <GameProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}> 
                    <Router />
                  </WouterRouter>
                </GameProvider>
              </FinanceProvider>
            </AchievementProvider>
          </XPProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
    </ErrorBoundary>
  );
}
