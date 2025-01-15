import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "@/lib/utils";

export function AppNavbar() {
  return (
      <Navbar className="top-1" />
  );
}


function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}>
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Trading">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/stock-trading">Stock Trading</HoveredLink>
            <HoveredLink href="/crypto-trading">Crypto Trading</HoveredLink>
            <HoveredLink href="/forex">Forex</HoveredLink>
            <HoveredLink href="/commodities">Commodities</HoveredLink>
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="AI Tools">
          <div className="text-sm grid grid-cols-2 gap-10 p-4">
                        <ProductItem
              title="AI Trading Bot"
              href="/trading-bot"
              src="https://placehold.co/140x70/1a1a1a/ffffff?text=Trading+Bot"
              description="Automated trading with advanced AI algorithms"
            />
            <ProductItem
              title="Risk Analyzer"
              href="/risk-analyzer"
              src="https://placehold.co/140x70/1a1a1a/ffffff?text=Risk+Analyzer"
              description="AI-powered risk assessment and portfolio optimization"
            />
            <ProductItem
              title="Market Predictor"
              href="/market-predictor"
              src="https://placehold.co/140x70/1a1a1a/ffffff?text=Market+Predictor"
              description="Predictive analytics for market trends"
            />
            <ProductItem
              title="Portfolio Manager"
              href="/portfolio-manager"
              src="https://placehold.co/140x70/1a1a1a/ffffff?text=Portfolio+Manager"
              description="Smart portfolio management with AI insights"
            />
          </div>
        </MenuItem>
        <MenuItem setActive={setActive} active={active} item="Analytics">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/market-analysis">Market Analysis</HoveredLink>
            <HoveredLink href="/technical-indicators">Technical Indicators</HoveredLink>
            <HoveredLink href="/fundamental-analysis">Fundamental Analysis</HoveredLink>
            <HoveredLink href="/sentiment-analysis">Sentiment Analysis</HoveredLink>
          </div>
        </MenuItem>
      </Menu>
    </div>
  );
}
