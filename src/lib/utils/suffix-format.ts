import { format } from 'd3-format';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const suffixFormat = (d: any) => format('.2s')(d).replace('G', 'B');
