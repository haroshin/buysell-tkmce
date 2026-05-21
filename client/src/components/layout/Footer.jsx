import { Link } from 'react-router-dom';
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import { CATEGORIES } from '../../utils/constants';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-950 border-t border-dark-800 mt-20">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-dark-50">Buy&Sell</h3>
                <p className="text-xs font-medium text-primary-400 tracking-wider">
                  TKMCE
                </p>
              </div>
            </Link>
            <p className="text-dark-400 text-sm leading-relaxed mb-4">
              The official marketplace for TKM College of Engineering students.
              Buy, sell, and exchange items within our campus community.
            </p>
            <div className="flex items-center gap-2 text-dark-400 text-sm">
              <HiOutlineLocationMarker className="text-primary-500 shrink-0" />
              <span>Karicode, Kollam, Kerala</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-dark-50 font-semibold mb-4">Categories</h4>
            <ul className="space-y-2.5">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/category/${cat.id}`}
                    className="text-dark-400 text-sm hover:text-primary-400 transition-colors duration-300"
                  >
                    {cat.emoji} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-dark-50 font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/sell"
                  className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
                >
                  Sell an Item
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
                >
                  Browse All
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-dark-400 text-sm hover:text-primary-400 transition-colors"
                >
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-dark-50 font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-dark-400 text-sm">
                <HiOutlineMail className="text-primary-500 shrink-0" />
                <span>support@buysell-tkmce.in</span>
              </li>
              <li className="flex items-center gap-2 text-dark-400 text-sm">
                <HiOutlinePhone className="text-primary-500 shrink-0" />
                <span>+91 XXXXX XXXXX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-dark-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-500 text-sm">
            © {currentYear} Buy&Sell TKMCE. Made with ❤️ for TKMCians.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="#"
              className="text-dark-500 text-sm hover:text-dark-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              to="#"
              className="text-dark-500 text-sm hover:text-dark-300 transition-colors"
            >
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
