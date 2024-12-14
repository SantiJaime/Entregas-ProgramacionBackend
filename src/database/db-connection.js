import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://santij03:6zxoy7ehrRwJ7ncu@cluster0.1weaa.mongodb.net/"
    );
    console.log("Base de datos conectada");
  } catch (error) {
    console.error(error);
  }
};
