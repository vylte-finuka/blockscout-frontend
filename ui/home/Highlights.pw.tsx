import React from 'react';

import type { HighlightsBannerConfig } from 'types/homepage';

import { test, expect } from 'playwright/lib';

import Highlights from './Highlights';

const IMAGE_URL_1 = 'https://localhost:3000/my-image.png';
const IMAGE_URL_2 = 'https://localhost:3000/my-image-2.png';
const IMAGE_URL_3 = 'https://localhost:3000/my-image-3.png';
const HIGHLIGHTS_CONFIG_URL = 'https://localhost:3000/homepage-highlights-config.json';
const HIGHLIGHTS_CONFIG: Array<HighlightsBannerConfig> = [
  // no adaptive → mais on met quand même [light, dark] pour cohérence
  {
    title: 'Duck Deep into Transactions',
    description: 'Explore and track all blockchain transactions',
    side_img_url: [ IMAGE_URL_1 ],
    title_color: [ '#E8B88A', '#F0D4A8' ],
    description_color: [ '#D4CBB5', '#E8D9C5' ],
    background: [
      'linear-gradient(135deg, #2A2A38 0%, #3A3A48 100%)',
      'linear-gradient(135deg, #1E1E2E 0%, #2D2D3A 50%, #3A2F2F 100%)',
    ],
    redirect_url: 'https://example.com',
    is_pinned: true,
  },
  // adaptive
  {
    title: 'Geese Token Swap',
    description: 'Swap tokens across different protocols',
    title_color: [ '#E8B88A', '#F5D9B3' ],
    description_color: [ '#C9BCA0', '#E8D9C5' ],
    background: [
      'linear-gradient(135deg, #2E2E3E 0%, #3C3C4C 50%, #4A3F3F 100%)',
      'linear-gradient(135deg, #1E1E2E 0%, #2D2D3A 50%, #3A2F2F 100%)',
    ],
    side_img_url: [ IMAGE_URL_2, IMAGE_URL_3 ],
    page_path: '/essential-dapps/swap',
    is_pinned: true,
  },
  // default → on ajoute les couleurs pour qu'il suive le thème
  {
    title: 'Duckling Smart Contracts',
    description: 'Discover newly deployed smart contracts',
    title_color: [ '#E8B88A', '#F0D4A8' ],
    description_color: [ '#D4CBB5', '#E8D9C5' ],
    background: [
      'linear-gradient(135deg, #2A2A38 0%, #3A3A48 100%)',
      'linear-gradient(135deg, #1E1E2E 0%, #2D2D3A 50%, #3A2F2F 100%)',
    ],
    is_pinned: true,
  },
];

test('three banners +@dark-mode', async({ render, mockEnvs, mockConfigResponse, mockAssetResponse }) => {
  await mockEnvs([
    [ 'NEXT_PUBLIC_HOMEPAGE_HIGHLIGHTS_CONFIG', HIGHLIGHTS_CONFIG_URL ],
  ]);
  await mockConfigResponse('NEXT_PUBLIC_HOMEPAGE_HIGHLIGHTS_CONFIG', HIGHLIGHTS_CONFIG_URL, HIGHLIGHTS_CONFIG);
  await mockAssetResponse(IMAGE_URL_1, './playwright/mocks/image_s.jpg');
  await mockAssetResponse(IMAGE_URL_2, './playwright/mocks/image_md.jpg');
  await mockAssetResponse(IMAGE_URL_3, './playwright/mocks/image_long.jpg');

  const component = await render(<Highlights/>);

  await expect(component).toHaveScreenshot();
});

test('two banners', async({ render, mockEnvs, mockConfigResponse, mockAssetResponse }) => {
  await mockEnvs([
    [ 'NEXT_PUBLIC_HOMEPAGE_HIGHLIGHTS_CONFIG', HIGHLIGHTS_CONFIG_URL ],
  ]);
  await mockConfigResponse('NEXT_PUBLIC_HOMEPAGE_HIGHLIGHTS_CONFIG', HIGHLIGHTS_CONFIG_URL, HIGHLIGHTS_CONFIG.slice(0, 2));
  await mockAssetResponse(IMAGE_URL_1, './playwright/mocks/image_s.jpg');
  await mockAssetResponse(IMAGE_URL_2, './playwright/mocks/image_md.jpg');
  await mockAssetResponse(IMAGE_URL_3, './playwright/mocks/image_long.jpg');

  const component = await render(<Highlights/>);

  await expect(component).toHaveScreenshot();
});
