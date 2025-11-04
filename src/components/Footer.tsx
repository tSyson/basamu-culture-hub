const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-12 md:mt-16 lg:mt-20">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="text-center space-y-3 md:space-y-4">
          <h3 className="text-lg md:text-xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
            BASAMU
          </h3>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-4">
            Celebrating and preserving the rich cultural heritage of Western Uganda through community, events, and shared traditions.
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            © {new Date().getFullYear()} BASAMU. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
