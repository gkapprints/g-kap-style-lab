import { sendOrderNotification } from "./email";

export async function sendOrderEmails(order: any) {
  const {
    shipping_address,
    order_items,
    subtotal,
    shipping_cost,
    total,
    id,
  } = order;

  const fullName = `${shipping_address.firstName} ${shipping_address.lastName}`;

  /* ---------------- ITEMS HTML ---------------- */
  const itemsHtml = order_items
    .map((item: any) => {
      // If this is a custom design order, show the actual uploaded image
      // Always show image and link for all order items
      let imageUrl = item.design_image_url || item.products?.image_url || "";
      let productName = item.design_id ? "Custom Design" : (item.products?.name || "Product");
      return `
        <tr>
          <td style="padding:10px;">
            <img 
              src="${imageUrl}" 
              alt="Product Image" 
              width="80"
              style="border-radius:8px;"
            />
            ${imageUrl ? `<br/><a href="${imageUrl}" target="_blank" style="font-size:12px;word-break:break-all;">View Image Link</a>` : ""}
          </td>
          <td style="padding:10px;">
            <b>${productName}</b><br/>
            Size: ${item.size}<br/>
            Color: ${item.color}<br/>
            Qty: ${item.quantity}
          </td>
          <td style="padding:10px;">₹${item.price}</td>
        </tr>
      `;
    })
    .join("");

  /* ---------------- EMAIL HTML ---------------- */
  const html = `
    <div style="font-family:Arial, sans-serif; color:#333;">
      <h2 style="color:#16a34a;">🛒 Order Confirmed</h2>

      <p><b>Order ID:</b> ${id}</p>

      <h3>👤 Customer Details</h3>
      <p>
        <b>Name:</b> ${fullName}<br/>
        <b>Email:</b> ${shipping_address.email}<br/>
        <b>Phone:</b> ${shipping_address.phone}
      </p>

      <h3>📦 Shipping Address</h3>
      <p>
        ${shipping_address.address}, ${shipping_address.apartment}<br/>
        ${shipping_address.city}, ${shipping_address.state}<br/>
        ${shipping_address.zip}, ${shipping_address.country}
      </p>

      <h3>🛍 Order Items</h3>
      <table border="1" cellpadding="0" cellspacing="0" width="100%">
        <thead>
          <tr>
            <th>Image</th>
            <th>Product</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <h3>💰 Price Summary</h3>
      <p>
        Subtotal: ₹${subtotal}<br/>
        Shipping: ₹${shipping_cost}<br/>
        <b>Total: ₹${total}</b>
      </p>

      <p style="margin-top:20px;">
        Thank you for shopping with <b>GKAP Prints</b> ❤️
      </p>
    </div>
  `;

  /* ---------------- ADMIN EMAIL ---------------- */
  await sendOrderNotification({
    to: process.env.NOTIFY_EMAIL_TO!,
    subject: `🛒 New Order Received - ${id}`,
    html,
  });

  /* ---------------- USER EMAIL ---------------- */
  await sendOrderNotification({
    to: shipping_address.email,
    subject: "Your Order is Confirmed 🎉",
    html,
  });
}
