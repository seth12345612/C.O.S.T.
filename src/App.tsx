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
import { Toaster } from "sonner";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GamePage from "@/pages/Game";
import Tutorial from "@/pages/Tutorial";
import Contact from "@/pages/Contact";
import Finance from "@/pages/Finance";

import Premium from "@/pages/Premium";
import Shop from "@/pages/Shop";
import Admin from "@/pages/Admin";
import Despre from "@/pages/Despre";
import Achievements from "@/pages/Achievements";
import Login from "@/pages/Login";
import Challenges from "@/pages/Challenges";
import LoginSuccess from "@/pages/LoginSuccess";
import PaymentSuccess from "@/pages/PaymentSuccess";
import Profile from "@/pages/Profile";
import QuizGame from "@/pages/QuizGame";
import StockGame from "@/pages/StockGame";
import UpgradeAdvanced from "@/pages/UpgradeAdvanced";
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
      <Route path="/shop" component={Shop} />
      <Route path="/admin" component={Admin} />
      <Route path="/despre" component={Despre} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/login" component={Login} />
      <Route path="/login/success" component={LoginSuccess} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/profile" component={Profile} />
      <Route path="/mini-game/quiz" component={QuizGame} />
      <Route path="/mini-game/bursa" component={StockGame} />
      <Route path="/upgrade-advanced" component={UpgradeAdvanced} />
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
              <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a2e', border: '1px solid rgba(139, 92, 246, 0.3)', color: '#f1f5f9' } }} />
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
