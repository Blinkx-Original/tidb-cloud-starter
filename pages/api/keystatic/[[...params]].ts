// pages/api/keystatic/[[...params]].ts
// API used by the Keystatic Admin UI
import { makeAPIRouteHandler } from '@keystatic/next/api';
import type { NextApiRequest, NextApiResponse } from 'next';
import config from '../../keystatic.config';  // two levels up to reach keystatic.config.ts

export default makeAPIRouteHandler({ config }) as unknown as (
  req: NextApiRequest,
  res: NextApiResponse
) => void;
