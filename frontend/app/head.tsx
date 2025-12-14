export default function Head() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const title = "AurAI";
  const description =
    "AurAI is an AI-powered assistant that helps you search and provide information.";
  const ogImage = `${siteUrl}/opengraph-image`;
  const twImage = `${siteUrl}/twitter-image`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="AurAI, AI assistant, search, information, chatbot, LLM" />
      <link rel="canonical" href={siteUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="AurAI" />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twImage} />

      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
