import { Cart } from "../models/carts.model.js";
import { Product } from "../models/products.model.js";

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
