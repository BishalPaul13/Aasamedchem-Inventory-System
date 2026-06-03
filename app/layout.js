import './globals.css';

export const metadata = {
  title: 'Aasa MedChem Inventory',
  description: 'Inventory and quotation management for flexible units.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
