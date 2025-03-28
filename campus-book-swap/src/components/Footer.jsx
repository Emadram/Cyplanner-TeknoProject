const Footer = () => {
  return (
    <footer className="py-4 px-8 bg-gray-50 border-t border-gray-200 text-center">
      <div>
        <p className="text-gray-600">&copy; {new Date().getFullYear()} YourApp. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
