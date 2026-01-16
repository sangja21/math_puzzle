import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://math-puzzle-alpha.vercel.app';

  const puzzles = [
    'hourglass',
    'doors',
    'balance',
    'river',
    'fakecoin',
    'josephus',
    'euclid',
    'sum_product',
    'sieve',
    'squares',
  ];

  const puzzleUrls = puzzles.map((id) => ({
    url: `${baseUrl}/puzzle/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...puzzleUrls,
  ];
}
