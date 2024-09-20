import MainNavigation from '../components/MainNavigation/MainNavigation';

function RootLayout({ children }) {
  return (
    <>
      <MainNavigation />
      <main>{children}</main>
      </>
  );
}

export default RootLayout;