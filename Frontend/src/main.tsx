import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import cái cây thư mục router (TanStack tự sinh ra hoặc Nhi đã cấu hình)
import { routeTree } from "./routeTree.gen";

// Import CSS (Phải có cái này thì Tailwind mới chạy nha Nhi)
import "./styles.css";

// Khởi tạo Router
const router = createRouter({ routeTree });

// Đăng ký router để hỗ trợ Type Safety (đúng chất dân IT Nhi nè)
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// "Bế" toàn bộ app đặt vào thẻ #root trong index.html
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
