import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SpreadsheetPage from "@/pages/spreadsheet";
import LandingPage from "@/pages/landing";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/spreadsheet/:id" component={SpreadsheetPage} />
      <Route path="/dashboard" component={SpreadsheetPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;