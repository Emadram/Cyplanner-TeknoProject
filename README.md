# 📚 CampusBookSwap

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0.17-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![DaisyUI](https://img.shields.io/badge/DaisyUI-5.0.9-5A0EF8?logo=daisyui&logoColor=white)](https://daisyui.com/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Strapi](https://img.shields.io/badge/Strapi-4.15.0-2F2E8B?logo=strapi&logoColor=white)](https://strapi.io/)
[![Firebase](https://img.shields.io/badge/Firebase-Hosting-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)

A modern, responsive web application that serves as a marketplace for students to buy, sell, borrow, and swap textbooks and other books.

## 🚀 Features

- **Multiple Transaction Types**: Support for selling, swapping, and borrowing books
- **User Authentication**: Secure sign-up and login flows
- **Book Management**: Add, edit, and remove book listings
- **Real-time Messaging**: Built-in chat system for communication between buyers and sellers
- **Shopping Cart**: Full shopping cart functionality for purchasing books
- **Dashboard**: User dashboard to manage listings and transactions
- **Responsive Design**: Mobile-friendly interface built with Tailwind CSS
- **Book Categories**: Browse books by categories or subjects
- **Search Functionality**: Find books by title, author, course, or subject

## 🛠️ Tech Stack

- **Frontend**: React.js with Vite
- **Routing**: React Router
- **Styling**: Tailwind CSS with DaisyUI
- **State Management**: React Context API
- **Backend**: Strapi CMS for content management and API
- **Hosting**: Firebase Hosting
- **Authentication**: JWT-based authentication via Strapi

## 📋 Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Modern web browser

## 🏁 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/campus-book-swap.git
   cd campus-book-swap
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root and add the following:
   ```
   VITE_API_URL=http://localhost:1337
   VITE_STRAPI_API_URL=http://localhost:1337
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This will generate a `dist` folder with all the production-ready files.

## 🏗️ Project Structure

```
/src
  /components        # Reusable UI components
  /contexts          # React Context providers
  /pages             # Page components
  /services          # API services
  App.jsx            # Main application component
  main.jsx           # Entry point
/public              # Static assets
```

## 🔄 Core Workflows

### Book Listing

1. Users can add books to sell, swap, or lend
2. They can specify book details, condition, price/terms
3. Upload cover images
4. Manage their listings from the dashboard

### Buying Books

1. Browse or search for books
2. Add books to cart
3. Checkout and payment
4. Message seller to arrange delivery/pickup

### Book Swapping

1. List books available for swap
2. Browse other swap listings
3. Message owners to propose exchanges
4. Arrange swap details through messaging

### Book Borrowing

1. List books available to borrow
2. Specify borrowing duration and terms
3. Request to borrow books from other users
4. Track borrowed/lent books

## 🔌 Backend Integration

This application is designed to work with a Strapi backend. Make sure you have a Strapi instance running with the appropriate content types:

- Books
- Categories
- Users
- Messages
- CartItems

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [Strapi](https://strapi.io/)
