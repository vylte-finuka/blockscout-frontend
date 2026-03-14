import { Box, chakra } from '@chakra-ui/react';
import React from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
}

const Container = ({ children, className }: Props) => {
  return (
    <Box
      className={ className }
      minWidth={{ base: '100vw', lg: 'fit-content' }}
      m="0 auto"
      // Fond fallback (couleur solide si l'image ne charge pas)
      bgColor="bg.primary"
      // Fond avec l'image Slura + overlay adapté light/dark
      bgImage={{
        base: 'url(\'/icons/Slura.png\')', // light
        _dark: 'url(\'/icons/Slura.png\')', // dark
      }}
      // Options d'affichage de l'image
      backgroundSize="cover" // ou "contain" si tu veux que l'image reste entière
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundAttachment="fixed" // optionnel : fond fixe quand on scroll
      // Pour que l'image reste visible même si le contenu dépasse
      minHeight="100vh"
      position="relative"
      // Améliore le contraste si besoin
      _after={{
        content: '""',
        position: 'absolute',
        inset: 0,
        bg: 'rgba(0,0,0,0.1)', // léger assombrissement global (optionnel)
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      { children }
    </Box>
  );
};

export default React.memo(chakra(Container));
