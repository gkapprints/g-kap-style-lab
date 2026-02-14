import { sendOrderNotification } from "./email";
import { supabase } from "../config/supabase";

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
  const isAdmin = shipping_address.email === "gkapprints@gmail.com" || process.env.NOTIFY_EMAIL_TO === "gkapprints@gmail.com";
  const itemsHtml = await Promise.all(
    order_items.map(async (item: any) => {
      let imageUrlSource = "";
      let imageUrl = "";
      if (item.design_image_url) {
        imageUrl = item.design_image_url;
        imageUrlSource = "design_image_url";
      } else {
        // Fetch product image for selected color
        const { data: productImage, error } = await supabase
          .from('product_images')
          .select('image_url')
          .eq('product_id', item.product_id)
          .eq('color', item.color)
          .order('display_order', { ascending: true })
          .limit(1)
          .single();
        if (error) {
          console.error('Error fetching product image:', error);
        }
        imageUrl = productImage?.image_url || item.products?.image_url || '/placeholder-product.svg';
        imageUrlSource = productImage?.image_url ? 'product_images_table' : (item.products?.image_url ? 'products.image_url' : 'placeholder');
      }
      console.log("EMAIL IMAGE URL:", imageUrl, "SOURCE:", imageUrlSource, "ITEM:", item);
      let productName = item.design_id ? "Custom Design" : (item.products?.name || "Product");
      let productIdHtml = isAdmin && item.product_id ? `<br/><span style='font-size:12px;color:#888;'>Product ID: ${item.product_id}</span>` : "";
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
            ${productIdHtml}
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
  );
  const itemsHtmlStr = itemsHtml.join("");

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
          ${itemsHtmlStr}
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
