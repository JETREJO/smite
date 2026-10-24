"use client";

import { useId, useState, type ReactNode } from "react";

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  /** Tab shown first; defaults to the first one. */
  defaultKey?: string;
}

/** Every panel stays mounted (only hidden), so unsaved form changes survive a tab switch. */
export function Tabs({ tabs, defaultKey }: TabsProps) {
  const [activeKey, setActiveKey] = useState(
    tabs.some((tab) => tab.key === defaultKey) ? defaultKey : tabs[0]?.key,
  );
  const baseId = useId();

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" className="flex gap-1 border-b border-line">
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`${baseId}-panel-${tab.key}`}
              onClick={() => setActiveKey(tab.key)}
              className={
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors " +
                (isActive ? "border-accent text-fg" : "border-transparent text-fg-muted hover:text-fg")
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.key}
          role="tabpanel"
          id={`${baseId}-panel-${tab.key}`}
          aria-labelledby={`${baseId}-tab-${tab.key}`}
          hidden={tab.key !== activeKey}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
