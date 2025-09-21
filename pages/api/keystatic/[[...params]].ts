// pages/api/keystatic/[[...params]].ts
import { makeAPIRouteHandler } from '@keystatic/next/api';
import type { NextApiRequest, NextApiResponse } from 'next';
import config from '../../../keystatic.config';

export default makeAPIRouteHandler({ config }) as unknown as (
  req: NextApiRequest,
  res: NextApiResponse
) => void;
