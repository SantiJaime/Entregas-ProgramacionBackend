import { Cart } from "../models/carts.model.js";
import { Product } from "../models/products.model.js";
import { Ticket } from "../models/tickets.model.js";
import { UserModel } from "../models/users.model.js";
import { v4 as uuidv4 } from "uuid";

export const getAllCarts = async (req, res) => {
  try {
    const allCarts = await Cart.find().lean();
    res.render("carts", { allCarts });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Error al obtener los carritos", error: error.message });
  }
};

export const getAllCartsNoRender = async (req, res) => {
  try {
    const allCarts = await Cart.find();
    res.status(200).json({ msg: "Carritos obtenidos correctamente", allCarts });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al obtener los carritos", error: error.message });
  }
};

export const getOneCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid)
      .populate("products.productId")
      .lean();

    if (!cart) {
      return res.status(404).json({ msg: "Carrito no encontrado" });
    }
    res.render("oneCartView", { cart });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al obtener el carrito", error: error.message });
  }
};

export const createCart = async (req, res) => {
  try {
    const newCart = new Cart();
    await newCart.save();

    req.io.emit("createCart", newCart);
    res.status(201).json({ msg: "Carrito creado correctamente", newCart });
  } catch (error) {
    res
      .status(500)
      .json({ msg: "Error al crear el carrito", error: error.message });
  }
};

export const addProductInCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ msg: "Carrito no encontrado" });
    }

    const product = await Product.findById(req.params.pid);

    if (!product) {
      return res
        .status(404)
        .json({ msg: `Producto con ID ${req.params.pid} no encontrado` });
    }

    const prodInCart = cart.products.find(
      (prod) => prod.productId.toString() === req.params.pid
    );

    if (prodInCart) {
      prodInCart.quantity++;
      await cart.save();

      return res.status(200).json({
        msg: `Se ha aumentado la cantidad del producto ${req.params.pid} en el carrito ${req.params.cid}`,
        cart,
      });
    }

    cart.products.push({ productId: product._id, quantity: 1 });
    await cart.save();

    res.status(200).json({
      msg: `Se ha agregado el producto ${req.params.pid} al carrito ${req.params.cid}`,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al agregar el producto al carrito",
      error: error.message,
    });
  }
};

export const checkout = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ msg: "Carrito no encontrado" });
    }

    if (cart.products.length === 0) {
      return res.status(404).json({ msg: "El carrito está vacío" });
    }

    const errors = [];
    let total = 0;

    for (let i = cart.products.length - 1; i >= 0; i--) {
      const prod = cart.products[i];
      const product = await Product.findById(prod.productId);

      if (product.stock < prod.quantity) {
        errors.push(`Producto de ID ${product._id}`);
        cart.products.splice(i, 1);
      } else {
        product.stock -= prod.quantity;
        total += product.price * prod.quantity;

        await product.save();
      }
    }
    await cart.save();

    if (errors.length > 0) {
      return res.status(400).json({ msg: "Compra no finalizada", errors });
    }

    const user = await UserModel.findById(cart.userId);
    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    const purchase_datetime = new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date())

    const ticket = new Ticket({
      code: uuidv4(),
      purchase_datetime,
      amount: total,
      purchaser: user.email,
    });

    await ticket.save();

    cart.products = [];

    await cart.save();

    res.status(200).json({
      msg: `Se ha finalizado la compra del carrito ${req.params.cid} y se ha generado un ticket con el código ${ticket.code}`,
      errors,
      cart,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: "Error al finalizar la compra", error: error.message });
  }
};

export const editProductsInCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);
    const newProducts = [];
    if (!cart) {
      return res.status(404).json({ msg: "Carrito no encontrado" });
    }

    for (const prod of req.body.products) {
      const product = await Product.findById(prod._id);
      if (!product) {
        return res
          .status(404)
          .json({ msg: `Producto con ID ${prod._id} no encontrado` });
      }
      newProducts.push({ product: product._id, quantity: prod.quantity });
    }

    cart.products = newProducts;
    await cart.save();

    res.status(200).json({
      msg: `Se han actualizado los productos del carrito ${req.params.cid}`,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar los productos del carrito",
      error: error.message,
    });
  }
};

export const updateProductQuantityInCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      return res.status(404).json({ msg: "Carrito no encontrado" });
    }

    const prodInCart = cart.products.find(
      (prod) => prod.product.toString() === req.params.pid
    );

    if (!prodInCart) {
      return res.status(404).json({
        msg: `Producto con ID ${req.params.pid} no encontrado en el carrito`,
      });
    }

    prodInCart.quantity = req.body.quantity;
    await cart.save();

    res.status(200).json({
      msg: `Se ha actualizado la cantidad del producto ${req.params.pid} en el carrito ${req.params.cid}`,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al actualizar la cantidad del producto",
      error: error.message,
    });
  }
};

export const deleteProductInCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      return res.status(404).json({ msg: "Carrito no encontrado" });
    }

    const prodInCart = cart.products.find(
      (prod) => prod.product.toString() === req.params.pid
    );

    if (!prodInCart) {
      return res
        .status(404)
        .json({ msg: `Producto con ID ${pid} no encontrado` });
    }

    cart.products = cart.products.filter(
      (prod) => prod.product.toString() !== req.params.pid
    );
    await cart.save();

    res.status(200).json({
      msg: `Se ha eliminado el producto ${req.params.pid} del carrito ${req.params.cid}`,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al eliminar el producto del carrito",
      error: error.message,
    });
  }
};

export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cid);

    if (!cart) {
      return res.status(404).json({ msg: "Carrito no encontrado" });
    }
    if (cart.products.length === 0) {
      return res.status(404).json({ msg: "El carrito ya se encuentra vacío" });
    }
    cart.products = [];
    await cart.save();

    req.io.emit("deleteCart", cart);

    res.status(200).json({
      msg: `Se han eliminado los productos del carrito ${req.params.cid}`,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error al eliminar los productos del carrito",
      error: error.message,
    });
  }
};
