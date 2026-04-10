import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { ToastProvider } from './components/ToastProvider'

const noop = () => {};
const originalError = console.error.bind(console);
console.log = noop;
console.info = noop as any;
console.debug = noop as any;
console.warn = noop as any;
console.error = (...args: any[]) => {
  try {
    const msg = args.find(a => typeof a === 'string') ?? 'Error';
    originalError(msg);
  } catch {}
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);
