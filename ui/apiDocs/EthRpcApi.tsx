import { Box, Text } from '@chakra-ui/react';
import React from 'react';

import { Link } from 'toolkit/chakra/link';

const EthRpcApi = () => {
  return (
    <Box>
      <Text>
        In addition to the custom RPC endpoints documented here,
        the Slura explorer VEZ RPC API supports 3 methods in the exact format specified for Slura nodes,
        ee the Ethereum-based JSON-RPC Specification for more details.
      </Text>
      <Link href="https://ethereum.github.io/execution-apis/" external mt={ 6 }>View examples</Link>
    </Box>
  );
};

export default React.memo(EthRpcApi);
