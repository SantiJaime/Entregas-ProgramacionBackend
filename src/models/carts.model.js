import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  products: {
    type: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    default: [],
    _id: false,
  },
});

export const Cart = model("Cart", cartSchema);
