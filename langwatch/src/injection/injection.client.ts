import type { NextPage } from "next";
import type React from "react";

export interface Dependencies {
  SubscriptionPage?: React.FC;
  ExtraMenuItems?: React.FC;
  extraPagesRoutes?: Record<string, NextPage>;
}

const dependencies: Dependencies = {};

export default dependencies;
