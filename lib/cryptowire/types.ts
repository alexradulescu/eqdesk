export type Article = {
  id: string;
  title: string;
  category: string;
  publishedAt: string;
  image: { url: string; alt: string } | null;
  body: string;
};

export type ArticleSummary = Omit<Article, "body">;

export type Price = {
  symbol: string;
  name: string;
  price: string;
  decimals: number;
  change24h: string;
};
