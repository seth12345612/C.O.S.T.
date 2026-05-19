import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GameProvider } from "@/context/GameContext";
import { XPProvider } from "@/context/XPContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GamePage from "@/pages/Game";
import Tutorial from "@/pages/Tutorial";
import Contact from "@/pages/Contact";
import Finance from "@/pages/Finance";
import Leaderboard from "@/pages/Leaderboard";
import Premium from "@/pages/Premium";

const queryClient = new QueryClient();

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
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <XPProvider>
            <FinanceProvider>
              <AuthProvider>
                <GameProvider>
                  <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}> 
                    <Router />
                  </WouterRouter>
                </GameProvider>
              </AuthProvider>
            </FinanceProvider>
          </XPProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
