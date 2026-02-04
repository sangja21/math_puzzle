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
    'multiplication', // Main page
  ];

  const puzzleUrls = puzzles.map((id) => ({
    url: `${baseUrl}/puzzle/${id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const subPageUrls = [
    'multiplication/quiz',
    'multiplication/block-coding',
    'multiplication/principle-quiz',
    'multiplication/brute-force',
  ].map((path) => ({
    url: `${baseUrl}/puzzle/${path}`,
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
    ...subPageUrls,
  ];
}
