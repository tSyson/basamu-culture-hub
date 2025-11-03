const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
            BASAMU
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Celebrating and preserving the rich cultural heritage of Western Uganda through community, events, and shared traditions.
          </p>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BASAMU. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
