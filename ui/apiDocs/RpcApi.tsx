import { Box, Text } from '@chakra-ui/react';
import React from 'react';

const RpcApi = () => {
  return (
    <Box>
      <Text>
        This API is provided for developers transitioning applications from Etherscan to Slura explorer and applications requiring general API and data support.
        It supports GET and POST requests.
      </Text>
    </Box>
  );
};

export default React.memo(RpcApi);
