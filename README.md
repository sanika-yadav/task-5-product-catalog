# ShopEase – Full Stack Web Development Internship Task 5

## What is included
This mini e-commerce Product Catalog implements all required Task-5 features:
- Dynamic product data loaded from `products.json`
- Responsive product grid
- Search by product title
- Category filtering
- Price/name sorting
- Pagination (8 products per page)
- Product detail page
- Add to cart using LocalStorage
- Quantity increase/decrease
- Remove from cart
- Dedicated cart page with totals
- Responsive mobile UI

The assignment brief asks for a product listing page, Search + Filter + Sorting + Pagination, a LocalStorage cart, a dedicated cart page and clean responsive UI. See the provided Task-5 PDF, pages 1–2. 

## Folder
- `index.html` – product listing page
- `product.html` – product detail page
- `cart.html` – cart page
- `products.json` – product data
- `style.css` – responsive styling
- `script.js` – filtering, sorting, pagination and cart logic

## How to run
Because the browser fetches `products.json`, use VS Code Live Server.

1. Open this folder in VS Code.
2. Install the **Live Server** extension if it is not already installed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.
5. Test search, filters, sorting, pagination, product details and cart.

## Technologies
HTML5, CSS3, JavaScript, JSON, LocalStorage.

## Notes
Product images use remote Unsplash image URLs, so an internet connection is needed for those images. The product data itself is stored locally in `products.json`.
