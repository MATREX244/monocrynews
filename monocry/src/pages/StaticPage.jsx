const PAGES = {
  about: {
    title: 'About Monocry',
    content: `
      <h2>Who We Are</h2>
      <p>Monocry is an independent cryptocurrency news and markets platform. We cover the latest news, market analysis, predictions, and deep dives in the crypto space.</p>
      <h2>Our Mission</h2>
      <p>To deliver accurate, timely, and unbiased crypto coverage to a global audience — without the noise.</p>
      <h2>Editorial Standards</h2>
      <p>All content is fact-checked before publication. We do not accept payment for editorial coverage. Sponsored content is clearly labeled.</p>
      <p><strong>Disclaimer:</strong> Nothing on Monocry constitutes financial advice. Always do your own research (DYOR).</p>
    `
  },
  contact: {
    title: 'Contact Us',
    content: `
      <h2>Get in Touch</h2>
      <p>For editorial inquiries, partnership proposals, or advertising opportunities, reach us at:</p>
      <p><strong>Email:</strong> contact@monocrynews.com</p>
      <p><strong>Twitter/X:</strong> @MonocryNews</p>
      <p><strong>Telegram:</strong> t.me/MonocryNews</p>
      <h2>Press</h2>
      <p>For press inquiries or media kit requests, please use the email above with subject line "Press".</p>
    `
  },
  privacy: {
    title: 'Privacy Policy',
    content: `
      <h2>Data We Collect</h2>
      <p>We collect minimal data needed to operate the site: session information, device fingerprint (for security and anti-abuse), and pages visited. We do not sell or share personal data with third parties.</p>
      <h2>Cookies</h2>
      <p>We use essential cookies for session management and optional analytics cookies (only with your consent). See our Cookie Policy for details.</p>
      <h2>Third-Party Services</h2>
      <p>We use Supabase for data storage and A-ADS for advertising. These have their own privacy policies.</p>
      <h2>Your Rights</h2>
      <p>You may request deletion of your data at any time by contacting us.</p>
      <p><em>Last updated: 2025</em></p>
    `
  },
  terms: {
    title: 'Terms of Service',
    content: `
      <h2>Acceptance</h2>
      <p>By using Monocry, you agree to these terms. If you disagree, please do not use the site.</p>
      <h2>Content</h2>
      <p>Content on Monocry is for informational purposes only. Nothing constitutes financial, legal, or investment advice.</p>
      <h2>User Conduct</h2>
      <p>You agree not to attempt to breach the site's security, submit false information, or engage in abusive behavior.</p>
      <h2>Disclaimers</h2>
      <p>Cryptocurrency investments carry high risk. Past performance is not indicative of future results. DYOR.</p>
      <p><em>Last updated: 2025</em></p>
    `
  },
  cookies: {
    title: 'Cookie Policy',
    content: `
      <h2>What Are Cookies?</h2>
      <p>Cookies are small text files stored in your browser. We use them to provide a better experience.</p>
      <h2>Types We Use</h2>
      <p><strong>Essential:</strong> Required for the site to work. Cannot be disabled.</p>
      <p><strong>Analytics:</strong> Anonymous usage statistics to help us improve the site.</p>
      <p><strong>Marketing:</strong> Used for advertising (A-ADS). Only with your consent.</p>
      <p><strong>Personalization:</strong> Remembers your preferences.</p>
      <h2>Managing Cookies</h2>
      <p>You can manage your preferences at any time via the cookie banner or your browser settings.</p>
    `
  },
  advertise: {
    title: 'Advertise with Monocry',
    content: `
      <h2>Reach Crypto Enthusiasts</h2>
      <p>Monocry reaches a global audience of crypto traders, investors, and enthusiasts. Our readers are engaged, high-intent users.</p>
      <h2>Ad Options</h2>
      <p><strong>Display Ads:</strong> Banner placements across news and market pages.</p>
      <p><strong>Sponsored Content:</strong> Clearly labeled sponsored articles or reviews.</p>
      <p><strong>Newsletter:</strong> Featured placements in our newsletter (coming soon).</p>
      <p><strong>Directory Listing:</strong> Feature your product in our crypto directory.</p>
      <h2>Get in Touch</h2>
      <p>Email: advertise@monocrynews.com</p>
    `
  },
  careers: {
    title: 'Careers',
    content: `
      <h2>Join the Team</h2>
      <p>We're a small, distributed team building the best independent crypto media platform. We value autonomy, quality, and intellectual honesty.</p>
      <h2>Open Positions</h2>
      <p>We're always looking for talented writers, developers, and crypto analysts. Send us your background and a writing sample or portfolio to:</p>
      <p><strong>careers@monocrynews.com</strong></p>
    `
  }
}

export default function StaticPage({ page }) {
  const content = PAGES[page]
  if (!content) return null

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">{content.title}</h1>
      <div
        className="text-gray-300 leading-relaxed space-y-4"
        style={{ fontSize: '0.95rem' }}
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
      <style>{`
        .space-y-4 h2 { font-size: 1.2rem; font-weight: 700; color: #fff; margin-top: 2rem; margin-bottom: 0.5rem; }
        .space-y-4 p { margin-bottom: 0.75rem; color: #ccc; }
        .space-y-4 strong { color: #e8e8e8; }
        .space-y-4 em { color: #888; }
      `}</style>
    </div>
  )
}
