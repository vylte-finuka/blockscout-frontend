import type { RollupType } from 'types/client/rollup';
import type { AdditionalTokenType } from 'types/client/token';
import type { NetworkVerificationType, NetworkVerificationTypeEnvs } from 'types/networks';

import { urlValidator } from 'toolkit/components/forms/validators/url';

import { getEnvValue, parseEnvJson } from './utils';

const DEFAULT_CURRENCY_DECIMALS = 18;

const rollupType = getEnvValue('NEXT_PUBLIC_ROLLUP_TYPE') as RollupType;

const verificationType: NetworkVerificationType = (() => {
  if (rollupType === 'arbitrum') {
    return 'posting';
  }
  if (rollupType === 'zkEvm') {
    return 'sequencing';
  }
  return getEnvValue('NEXT_PUBLIC_NETWORK_VERIFICATION_TYPE') as NetworkVerificationTypeEnvs || 'mining';
})();

const rpcUrls = (() => {
  const envValue = getEnvValue('NEXT_PUBLIC_NETWORK_RPC_URL');
  const isUrl = urlValidator(envValue);

  if (envValue && isUrl === true) {
    return [ envValue ];
  }

  const parsedValue = parseEnvJson<Array<string>>(envValue);

  return Array.isArray(parsedValue) ? parsedValue : [];
})();

const chain = Object.freeze({
  id: 45057,
  name: 'Vyft slura charène',
  shortName: 'Slura',
  currency: {
    name: 'Vyft Enhancing ZER',
    weiName: 'naeït',
    gweiName: 'Gnaeït',
    symbol: 'VEZ',
    decimals: Number(getEnvValue('NEXT_PUBLIC_NETWORK_CURRENCY_DECIMALS')) || DEFAULT_CURRENCY_DECIMALS,
  },
  secondaryCoin: {
    symbol: 'WVEZ',
  },
  hasMultipleGasCurrencies: getEnvValue('NEXT_PUBLIC_NETWORK_MULTIPLE_GAS_CURRENCIES') === 'true',
  tokenStandard: getEnvValue('NEXT_PUBLIC_NETWORK_TOKEN_STANDARD_NAME') || 'SLURC',
  additionalTokenTypes: parseEnvJson<Array<AdditionalTokenType>>('ERC') || [],
  rpcUrls,
  isTestnet: getEnvValue('NEXT_PUBLIC_IS_TESTNET') === 'true',
  verificationType,
});

export default chain;
