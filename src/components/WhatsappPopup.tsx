import { useEffect, useState } from "react";

const whatsappNumber = "7287980727"; // Replace with your WhatsApp number
const whatsappMessage = encodeURIComponent("Hello! I have a question about G-KAP.");
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

export const WhatsappPopup = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Optionally, add logic to hide/show based on scroll or inactivity
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      right: 24,
      zIndex: 9999,
      background: "#25D366",
      borderRadius: "50%",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      width: 60,
      height: 60,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
    }}
      onClick={() => window.open(whatsappUrl, "_blank")}
      title="Chat on WhatsApp"
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#25D366" />
        <path d="M23.5 9.5C22.1 8.1 20.2 7.2 18.1 7.2C13.7 7.2 10.1 10.8 10.1 15.2C10.1 16.7 10.6 18.1 11.5 19.3L9.5 23.5L13.7 21.5C14.9 22.4 16.3 22.9 17.8 22.9C22.2 22.9 25.8 19.3 25.8 14.9C25.8 12.8 24.9 10.9 23.5 9.5ZM18.1 21.1C16.8 21.1 15.6 20.7 14.6 19.9L14.3 19.7L11.9 20.7L12.9 18.3L12.7 18C11.9 17 11.5 15.7 11.5 14.3C11.5 11.1 14.1 8.5 17.3 8.5C19.7 8.5 21.9 10.7 21.9 13.1C21.9 16.3 19.3 18.9 16.1 18.9C15.7 18.9 15.3 18.8 14.9 18.7L14.7 18.6L13.7 19.6L14.7 18.6C15.3 18.8 15.7 18.9 16.1 18.9C19.3 18.9 21.9 16.3 21.9 13.1C21.9 10.7 19.7 8.5 17.3 8.5C14.1 8.5 11.5 11.1 11.5 14.3C11.5 15.7 11.9 17 12.7 18L12.9 18.3L11.9 20.7L14.3 19.7L14.6 19.9C15.6 20.7 16.8 21.1 18.1 21.1Z" fill="white" />
      </svg>
    </div>
  );
};
